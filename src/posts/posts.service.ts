import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Post } from './entities/post.entity';
import { User } from '../users/entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UpdatePostResponseDto } from './dto/update-post-response.dto';
import { ListPostsDto } from './dto/list-posts.dto';
import {
  PostListItemDto,
  ListPostsResponseDto,
} from './dto/list-posts-response.dto';
import { PostVisibility } from './enums/post-visibility.enum';
import { handleDatabaseError } from '../common/utils/handle-database-error';
import { mapPostToUpdateDto } from './mappers/post.mapper';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async createPost(dto: CreatePostDto, authorId: number): Promise<Post> {
    try {
      const entity = this.postsRepository.create({
        title: dto.title,
        content: dto.content,
        visibility: dto.visibility,
        author: { id: authorId } as User,
      });

      return this.postsRepository.save(entity);
    } catch (error) {
      handleDatabaseError(error, 'create post');
    }
  }

  async updatePost(
    postId: number,
    dto: UpdatePostDto,
    userId: number,
  ): Promise<UpdatePostResponseDto> {
    try {
      // First, find the post and verify ownership
      const post = await this.postsRepository.findOne({
        where: { id: postId },
        relations: ['author'],
      });

      if (!post) {
        throw new NotFoundException(`Post with ID ${postId} not found`);
      }

      // Check if the user owns the post
      if (post.author.id !== userId) {
        throw new ForbiddenException('You can only edit your own posts');
      }

      // Update only the provided fields
      if (dto.title !== undefined) {
        post.title = dto.title;
      }
      if (dto.content !== undefined) {
        post.content = dto.content;
      }
      if (dto.visibility !== undefined) {
        post.visibility = dto.visibility;
      }
      const updatedPost = await this.postsRepository.save(post);
      return mapPostToUpdateDto(updatedPost);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      handleDatabaseError(error, 'update post');
    }
  }

  async deletePost(postId: number, userId: number, user: User): Promise<void> {
    try {
      // First, find the post and verify it exists
      const post = await this.postsRepository.findOne({
        where: { id: postId },
        relations: ['author'],
      });

      if (!post) {
        throw new NotFoundException(`Post with ID ${postId} not found`);
      }

      // Check permissions:
      // 1. User can delete their own post if they have DELETE_POST_OWN permission
      // 2. Admin can delete any post if they have DELETE_POST_ANY permission

      const userPermissions = user.roles.flatMap(
        (role) => role.permissions?.map((permission) => permission.name) || [],
      );

      const canDeleteOwn =
        post.author.id === userId &&
        userPermissions.includes('delete_post_own');
      const canDeleteAny = userPermissions.includes('delete_post_any');

      if (!canDeleteOwn && !canDeleteAny) {
        throw new ForbiddenException(
          'You do not have permission to delete this post',
        );
      }

      await this.postsRepository.remove(post);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      handleDatabaseError(error, 'delete post');
    }
  }

  async listPosts(
    dto: ListPostsDto,
    userId?: number,
  ): Promise<ListPostsResponseDto> {
    return this.getPostsWithFilters(
      dto,
      (queryBuilder) => {
        // Show public posts + user's own private posts
        queryBuilder.where(
          '(post.visibility = :publicVisibility OR (post.visibility = :privateVisibility AND post.author.id = :userId))',
          {
            publicVisibility: PostVisibility.PUBLIC,
            privateVisibility: PostVisibility.PRIVATE,
            userId,
          },
        );
      },
      'list posts',
    );
  }

  async listUserPosts(
    dto: ListPostsDto,
    targetUserId: number,
    requestingUserId?: number,
  ): Promise<ListPostsResponseDto> {
    return this.getPostsWithFilters(
      dto,
      (queryBuilder) => {
        // Show posts authored by the target user
        queryBuilder.where('post.author.id = :targetUserId', { targetUserId });

        // If requesting user is different from target user, only show public posts
        // If requesting user is the same as target user, show all posts (public + private)
        if (requestingUserId !== targetUserId) {
          queryBuilder.andWhere('post.visibility = :publicVisibility', {
            publicVisibility: PostVisibility.PUBLIC,
          });
        }
      },
      'list user posts',
    );
  }

  private async getPostsWithFilters(
    dto: ListPostsDto,
    whereClause: (queryBuilder: SelectQueryBuilder<Post>) => void,
    operation: string,
  ): Promise<ListPostsResponseDto> {
    try {
      const { page = 1, limit = 10, search } = dto;
      const skip = (page - 1) * limit;

      const queryBuilder = this.postsRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.author', 'author');

      // Apply the specific where clause
      whereClause(queryBuilder);

      // Apply search filter if provided
      if (search) {
        queryBuilder.andWhere(
          '(post.title ILIKE :search OR post.content ILIKE :search)',
          { search: `%${search}%` },
        );
      }

      queryBuilder.orderBy('post.createdAt', 'DESC').skip(skip).take(limit);

      const [posts, total] = await queryBuilder.getManyAndCount();

      const totalPages = Math.ceil(total / limit) || 1;
      // Validate that the requested page is within bounds
      if (total > 0 && page > totalPages) {
        throw new NotFoundException(
          `Page ${page} not found. Total pages available: ${totalPages}`,
        );
      }
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const postItems: PostListItemDto[] = posts.map((post) => ({
        id: post.id,
        title: post.title,
        visibility: post.visibility,
        timeToRead: this.calculateTimeToRead(post.content),
        authorId: post.author.id,
        authorName: post.author.name,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      }));

      return {
        posts: postItems,
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
      handleDatabaseError(error, operation);
    }
  }

  private calculateTimeToRead(content: string): number {
    // Average reading speed is about 200-250 words per minute
    // We'll use 200 words per minute as a conservative estimate
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    const timeToRead = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
    return timeToRead;
  }
}
