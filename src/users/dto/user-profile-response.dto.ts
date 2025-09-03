import { ApiProperty } from '@nestjs/swagger';

export class UserProfileResponseDto {
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
    example: 'Software developer passionate about clean code and technology',
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
}
