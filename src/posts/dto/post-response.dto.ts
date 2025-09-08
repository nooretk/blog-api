import { ApiProperty } from '@nestjs/swagger';
import { PostVisibility } from 'src/posts/enums/post-visibility.enum';

export class PostResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Unique post identifier',
  })
  id: number;

  @ApiProperty({
    example: 'My First Blog Post',
    description: 'Post title',
  })
  title: string;

  @ApiProperty({
    example: 'This is the content of my first blog post...',
    description: 'Post content',
  })
  content: string;

  @ApiProperty({
    example: PostVisibility.PUBLIC,
    description: 'Post visibility setting',
    enum: PostVisibility,
  })
  visibility: PostVisibility;

  @ApiProperty({
    description: 'Post author information',
    example: {
      id: 1,
    },
  })
  author: {
    id: number;
  };

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
