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
import { PostVisibility } from '../enums/post-visibility.enum';

@Entity('posts')
export class Post {
  @ApiProperty({
    example: 1,
    description: 'Unique post identifier',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'My First Blog Post',
    description: 'Post title',
    maxLength: 255,
  })
  @Column({ length: 255 })
  title: string;

  @ApiProperty({
    example: 'This is the content of my first blog post...',
    description: 'Post content',
  })
  @Column('text')
  content: string;

  @ApiProperty({
    example: PostVisibility.PUBLIC,
    description: 'Post visibility setting',
    enum: PostVisibility,
  })
  @Column({
    type: 'enum',
    enum: PostVisibility,
    default: PostVisibility.PUBLIC,
  })
  visibility: PostVisibility;

  @ApiProperty({
    description: 'Post author',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.posts)
  author: User;

  @ApiProperty({
    example: '2025-09-07T12:34:56.789Z',
    description: 'Post creation timestamp',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    example: '2025-09-07T12:34:56.789Z',
    description: 'Post last update timestamp',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
