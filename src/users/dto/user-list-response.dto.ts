import { ApiProperty } from '@nestjs/swagger';

export class UserListItemDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User biography or description',
    example: 'Software developer passionate about clean code',
    nullable: true,
  })
  bio: string | null;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2025-09-01T12:34:56.789Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Account last update timestamp',
    example: '2025-09-03T10:15:30.123Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'User roles',
    example: [{ id: 1, name: 'user', description: 'Regular user' }],
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'user' },
        description: { type: 'string', example: 'Regular user' },
      },
    },
  })
  roles: Array<{
    id: number;
    name: string;
    description: string;
  }>;
}

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
