import { IsInt, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRoleDto {
  @ApiProperty({
    example: 1,
    description: 'Unique identifier of the user to assign/revoke the role',
    minimum: 1,
    type: 'integer',
  })
  @IsInt({ message: 'User ID must be a valid integer' })
  @Min(1, { message: 'User ID must be greater than 0' })
  userId: number;

  @ApiProperty({
    example: 'admin',
    description:
      'Name of the role to assign/revoke (e.g., admin, user, moderator)',
    enum: ['admin', 'user', 'moderator'],
    type: 'string',
  })
  @IsString({ message: 'Role name must be a string' })
  roleName: string;
}
