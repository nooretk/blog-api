import { ApiProperty } from '@nestjs/swagger';
import { PostVisibility } from '../enums/post-visibility.enum';

export class PostListItemDto {
  @ApiProperty({
    example: 1,
    description: 'Post ID',
  })
  id: number;

  @ApiProperty({
    example: 'My First Blog Post',
    description: 'Post title',
  })
  title: string;

  @ApiProperty({
    example: PostVisibility.PUBLIC,
    description: 'Post visibility setting',
    enum: PostVisibility,
  })
  visibility: PostVisibility;

  @ApiProperty({
    example: 5,
    description: 'Estimated time to read in minutes',
  })
  timeToRead: number;

  @ApiProperty({
    example: 1,
    description: 'Author ID',
  })
  authorId: number;

  @ApiProperty({
    example: 'John Doe',
    description: 'Author name',
  })
  authorName: string;

  @ApiProperty({
    example: '2025-09-07T12:34:56.789Z',
    description: 'Post creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-09-07T12:34:56.789Z',
    description: 'Post last update timestamp',
  })
  updatedAt: Date;
}

export class ListPostsResponseDto {
  @ApiProperty({
    type: [PostListItemDto],
    description: 'List of posts',
  })
  posts: PostListItemDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    example: {
      page: 1,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNextPage: true,
      hasPrevPage: false,
    },
  })
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
