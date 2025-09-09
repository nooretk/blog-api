import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { User } from '../users/entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { ListPostsDto } from './dto/list-posts.dto';
import {
  PostListItemDto,
  ListPostsResponseDto,
} from './dto/list-posts-response.dto';
import { PostVisibility } from './enums/post-visibility.enum';
import { handleDatabaseError } from '../common/utils/handle-database-error';

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

  async listPosts(
    dto: ListPostsDto,
    userId?: number,
  ): Promise<ListPostsResponseDto> {
    try {
      const { page = 1, limit = 10, search } = dto;
      const skip = (page - 1) * limit;

      const queryBuilder = this.postsRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.author', 'author');

      // show public posts + user's own private posts

      queryBuilder.where(
        '(post.visibility = :publicVisibility OR (post.visibility = :privateVisibility AND post.author.id = :userId))',
        {
          publicVisibility: PostVisibility.PUBLIC,
          privateVisibility: PostVisibility.PRIVATE,
          userId,
        },
      );

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
      handleDatabaseError(error, 'list posts');
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
