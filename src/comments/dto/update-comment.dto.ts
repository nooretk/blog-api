import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDto {
  @ApiProperty({
    description: 'Content of the comment',
    example: 'This is an updated comment.',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;
}
