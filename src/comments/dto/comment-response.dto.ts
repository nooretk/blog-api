import { ApiProperty } from '@nestjs/swagger';

export class CommentResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the comment',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Content of the comment',
    example: 'This is a great post! Thanks for sharing.',
  })
  content: string;

  @ApiProperty({
    description: 'The unique identifier of the author',
    example: 1,
  })
  authorId: number;

  @ApiProperty({
    description: 'The name of the author',
    example: 'John Doe',
  })
  authorName: string;

  @ApiProperty({
    description: 'The unique identifier of the post',
    example: 1,
  })
  postId: number;

  @ApiProperty({
    description: 'Date and time when the comment was created',
    example: '2025-09-09T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date and time when the comment was last updated',
    example: '2025-09-09T14:30:00.000Z',
  })
  updatedAt: Date;
}

export class CommentListItemDto {
  @ApiProperty({
    description: 'The unique identifier of the comment',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Content of the comment',
    example: 'This is a great post! Thanks for sharing.',
  })
  content: string;

  @ApiProperty({
    description: 'The unique identifier of the author',
    example: 1,
  })
  authorId: number;

  @ApiProperty({
    description: 'The name of the author',
    example: 'John Doe',
  })
  authorName: string;

  @ApiProperty({
    description: 'Date and time when the comment was created',
    example: '2025-09-09T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date and time when the comment was last updated',
    example: '2025-09-09T14:30:00.000Z',
  })
  updatedAt: Date;
}

export class ListCommentsResponseDto {
  @ApiProperty({
    description: 'List of comments',
    type: [CommentListItemDto],
  })
  comments: CommentListItemDto[];

  @ApiProperty({
    description: 'Pagination information',
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
