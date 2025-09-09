import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class ListUsersDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search term to filter users by name or email',
    example: 'john',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
