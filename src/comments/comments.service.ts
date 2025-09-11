import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Post } from '../posts/entities/post.entity';
import { User } from '../users/entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ListCommentsDto } from './dto/list-comments.dto';
import {
  CommentResponseDto,
  CommentListItemDto,
  ListCommentsResponseDto,
} from './dto/comment-response.dto';
import { handleDatabaseError } from '../common/utils/handle-database-error';
import { PostVisibility } from '../posts/enums/post-visibility.enum';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async createComment(
    postId: number,
    dto: CreateCommentDto,
    author: User,
  ): Promise<CommentResponseDto> {
    try {
      // Check if the post exists and load author info
      const post = await this.postsRepository.findOne({
        where: { id: postId },
        relations: ['author'],
      });

      // Security: Return consistent error to prevent information disclosure
      // Don't reveal if post exists but is private vs doesn't exist at all
      if (
        !post ||
        (post.visibility === PostVisibility.PRIVATE &&
          post.author.id !== author.id)
      ) {
        throw new NotFoundException(`Post with ID ${postId} not found`);
      }

      const entity = this.commentsRepository.create({
        content: dto.content,
        author: { id: author.id } as User,
        post: { id: postId } as Post,
      });

      const savedComment = await this.commentsRepository.save(entity);

      return {
        id: savedComment.id,
        content: savedComment.content,
        authorId: author.id,
        authorName: author.name,
        postId: savedComment.post.id,
        createdAt: savedComment.createdAt,
        updatedAt: savedComment.updatedAt,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      handleDatabaseError(error, 'create comment');
    }
  }

  async getComment(
    commentId: number,
    userId?: number,
  ): Promise<CommentResponseDto> {
    try {
      const comment = await this.commentsRepository.findOne({
        where: { id: commentId },
        relations: ['author', 'post', 'post.author'],
      });

      // Security: Return consistent error to prevent information disclosure
      // Don't reveal if comment exists but belongs to private post vs doesn't exist at all
      if (
        !comment ||
        (comment.post.visibility === PostVisibility.PRIVATE &&
          comment.post.author.id !== userId)
      ) {
        throw new NotFoundException(`Comment with ID ${commentId} not found`);
      }

      return {
        id: comment.id,
        content: comment.content,
        authorId: comment.author.id,
        authorName: comment.author.name,
        postId: comment.post.id,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      handleDatabaseError(error, 'get comment');
    }
  }

  async listComments(
    postId: number,
    dto: ListCommentsDto,
    userId?: number,
  ): Promise<ListCommentsResponseDto> {
    try {
      // Check if the post exists and load author info
      const post = await this.postsRepository.findOne({
        where: { id: postId },
        relations: ['author'],
      });

      // Security: Return consistent error to prevent information disclosure
      // Don't reveal if post exists but is private vs doesn't exist at all
      if (
        !post ||
        (post.visibility === PostVisibility.PRIVATE &&
          post.author.id !== userId)
      ) {
        throw new NotFoundException(`Post with ID ${postId} not found`);
      }

      const { page = 1, limit = 10 } = dto;
      const skip = (page - 1) * limit;

      const [comments, total] = await this.commentsRepository.findAndCount({
        where: { post: { id: postId } },
        relations: ['author'],
        order: { createdAt: 'ASC' }, // Oldest first for comments
        skip,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit) || 1;
      // Validate that the requested page is within bounds
      if (total > 0 && page > totalPages) {
        throw new NotFoundException(
          `Page ${page} not found. Total pages available: ${totalPages}`,
        );
      }
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const commentItems: CommentListItemDto[] = comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        authorId: comment.author.id,
        authorName: comment.author.name,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      }));

      return {
        comments: commentItems,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      handleDatabaseError(error, 'list comments');
    }
  }

  async updateComment(
    commentId: number,
    dto: UpdateCommentDto,
    userId: number,
  ): Promise<CommentResponseDto> {
    try {
      // First, find the comment and verify ownership and access
      const comment = await this.commentsRepository.findOne({
        where: { id: commentId },
        relations: ['author', 'post', 'post.author'],
      });

      // Security: Return consistent error to prevent information disclosure
      // Don't reveal if comment exists but belongs to private post vs doesn't exist at all
      if (
        !comment ||
        (comment.post.visibility === PostVisibility.PRIVATE &&
          comment.post.author.id !== userId)
      ) {
        throw new NotFoundException(`Comment with ID ${commentId} not found`);
      }

      // Check if the user owns the comment
      if (comment.author.id !== userId) {
        throw new ForbiddenException('You can only edit your own comments');
      }

      // Update only the provided fields
      if (dto.content !== undefined) {
        comment.content = dto.content;
      }

      const updatedComment = await this.commentsRepository.save(comment);

      return {
        id: updatedComment.id,
        content: updatedComment.content,
        authorId: updatedComment.author.id,
        authorName: updatedComment.author.name,
        postId: updatedComment.post.id,
        createdAt: updatedComment.createdAt,
        updatedAt: updatedComment.updatedAt,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      handleDatabaseError(error, 'update comment');
    }
  }

  async deleteComment(commentId: number, user: User): Promise<void> {
    try {
      // First, find the comment and verify it exists and is accessible
      const comment = await this.commentsRepository.findOne({
        where: { id: commentId },
        relations: ['author', 'post', 'post.author'],
      });

      // Security: Return consistent error to prevent information disclosure
      // Don't reveal if comment exists but belongs to private post vs doesn't exist at all
      if (
        !comment ||
        (comment.post.visibility === PostVisibility.PRIVATE &&
          comment.post.author.id !== user.id)
      ) {
        throw new NotFoundException(`Comment with ID ${commentId} not found`);
      }

      // Check permissions:
      // 1. User can delete their own comment if they have DELETE_COMMENT_OWN permission
      // 2. Admin can delete any comment if they have DELETE_COMMENT_ANY permission

      const userPermissions = user.roles.flatMap(
        (role) => role.permissions?.map((permission) => permission.name) || [],
      );
      const canDeleteOwn =
        comment.author.id === user.id &&
        userPermissions.includes('delete_comment_own');

      const canDeleteAny = userPermissions.includes('delete_comment_any');

      if (!canDeleteOwn && !canDeleteAny) {
        throw new ForbiddenException(
          'You do not have permission to delete this comment',
        );
      }

      await this.commentsRepository.remove(comment);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      handleDatabaseError(error, 'delete comment');
    }
  }
}
