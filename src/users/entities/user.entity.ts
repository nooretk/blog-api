import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class User {
  @ApiProperty({
    example: 1,
    description: 'Unique user identifier',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
  })
  @Column()
  name: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'User email address (unique)',
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    example: '$2b$10$hashedpassword...',
    description: 'Hashed user password (bcrypt)',
  })
  @Column()
  password: string;

  @ApiProperty({
    example: 'A short bio about the user',
    description: 'Optional user biography',
    required: false,
  })
  @Column({ nullable: true })
  bio: string;

  @ApiProperty({
    example: '2025-09-01T12:34:56.789Z',
    description: 'User account creation timestamp',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
