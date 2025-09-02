import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty({
    description: 'New password for the user account',
    example: 'MyNewPassword123',
    minLength: 6,
    maxLength: 64,
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(64, { message: 'Password must not exceed 64 characters' })
  newPassword: string;
}
