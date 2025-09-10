import { IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PostVisibility } from '../enums/post-visibility.enum';

export class UpdatePostDto {
  @ApiProperty({
    description: 'Title of the post',
    example: 'My Updated Blog Post',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  title?: string;

  @ApiProperty({
    description: 'Content of the post',
    example: 'This is the updated content of my blog post...',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    description: 'Visibility of the post',
    enum: PostVisibility,
    example: PostVisibility.PUBLIC,
    required: false,
  })
  @IsOptional()
  @IsEnum(PostVisibility, {
    message: 'Visibility must be either PUBLIC or PRIVATE',
  })
  visibility?: PostVisibility;
}
