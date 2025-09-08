import { ApiProperty } from '@nestjs/swagger';

export class PasswordUpdateResponseDto {
  @ApiProperty({
    description: 'Success message confirming password update',
    example: 'Password updated successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Timestamp of the password update',
    example: '2025-09-03T10:15:30.123Z',
  })
  updatedAt: Date;
}
