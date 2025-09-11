import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';

@Entity('comments')
export class Comment {
  @ApiProperty({
    example: 1,
    description: 'Unique comment identifier',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'This is a great post! Thanks for sharing.',
    description: 'Comment content',
  })
  @Column('text')
  content: string;

  @ApiProperty({
    description: 'Comment author',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.comments)
  author: User;

  @ApiProperty({
    description: 'Post that the comment belongs to',
    type: () => Post,
  })
  @ManyToOne(() => Post, (post) => post.comments)
  post: Post;

  @ApiProperty({
    example: '2025-09-07T12:34:56.789Z',
    description: 'Comment creation timestamp',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    example: '2025-09-07T12:34:56.789Z',
    description: 'Comment last update timestamp',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
