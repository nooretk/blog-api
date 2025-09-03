import { ApiProperty } from '@nestjs/swagger';
import { UserListItemDto } from './user-list.dto';
export class PaginatedUsersResponseDto {
  @ApiProperty({
    description: 'List of users',
    type: [UserListItemDto],
  })
  users: UserListItemDto[];

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
