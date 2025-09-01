import {
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';

export function handleDatabaseError(error: any, operation: string): never {
  if (error instanceof EntityNotFoundError) {
    throw new NotFoundException('Resource not found');
  }
  if (error instanceof QueryFailedError) {
    if (error.message.includes('duplicate key value')) {
      throw new ConflictException('Email address already exists');
    }
    if (error.message.includes('violates check constraint')) {
      throw new BadRequestException('Invalid data provided');
    }
    if (error.message.includes('value too long')) {
      throw new BadRequestException('Field value exceeds maximum length');
    }
  }
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const errorWithCode = error as { code: string };
    if (
      errorWithCode.code === 'ECONNREFUSED' ||
      errorWithCode.code === 'ETIMEDOUT'
    ) {
      throw new InternalServerErrorException('Database connection failed');
    }
  }
  throw new InternalServerErrorException(`Failed to ${operation}`);
}
