import { ApiProperty } from '@nestjs/swagger';
import { PostVisibility } from '../enums/post-visibility.enum';

export class UpdatePostResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the post',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Title of the post',
    example: 'My Updated Blog Post',
  })
  title: string;

  @ApiProperty({
    description: 'Content of the post',
    example: 'This is the updated content of my blog post...',
  })
  content: string;

  @ApiProperty({
    description: 'Visibility of the post',
    enum: PostVisibility,
    example: PostVisibility.PUBLIC,
  })
  visibility: PostVisibility;

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
    description: 'Estimated time to read the post in minutes',
    example: 5,
  })
  timeToRead: number;

  @ApiProperty({
    description: 'Date and time when the post was created',
    example: '2025-09-09T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date and time when the post was last updated',
    example: '2025-09-09T14:30:00.000Z',
  })
  updatedAt: Date;
}
