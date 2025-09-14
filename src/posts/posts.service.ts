import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { User } from '../users/entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
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
}
