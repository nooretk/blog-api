import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Content of the comment',
    example: 'This is a great post! Thanks for sharing.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Content should not be empty' })
  content: string;
}
