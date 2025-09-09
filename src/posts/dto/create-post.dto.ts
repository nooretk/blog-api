import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { PostVisibility } from '../enums/post-visibility.enum';

export class CreatePostDto {
  @ApiProperty({
    description: 'Post title',
    example: 'My First Blog Post',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  title: string;

  @ApiProperty({
    description: 'Post content',
    example:
      'This is the content of my first blog post. It can contain multiple paragraphs and be quite long.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Post visibility setting',
    enum: PostVisibility,
    example: PostVisibility.PUBLIC,
    default: PostVisibility.PUBLIC,
    required: false,
  })
  @IsEnum(PostVisibility, {
    message: 'Visibility must be either PUBLIC or PRIVATE',
  })
  @IsOptional()
  visibility?: PostVisibility = PostVisibility.PUBLIC;
}
