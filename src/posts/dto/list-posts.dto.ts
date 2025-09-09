import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class ListPostsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search term to filter posts by title or content',
    example: 'javascript',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
