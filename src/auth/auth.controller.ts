import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request';
import { SignInDto } from './dto/signin.dto';
import { plainToInstance } from 'class-transformer';
import { User } from 'src/users/entities/user.entity';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      example: {
        message: 'User registered successfully',
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          bio: 'A short bio',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    schema: {
      example: {
        message: [
          'Name must be at least 2 characters long',
          'Please provide a valid email address',
          'Password must be at least 6 characters long',
        ],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - email already exists',
    schema: {
      example: {
        message: 'Email address already exists',
        error: 'Conflict',
        statusCode: 409,
      },
    },
  })
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return {
      message: 'User registered successfully',
      user: plainToInstance(User, user),
    };
  }

  @Post('login')
  @ApiOperation({ summary: 'Sign in user' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid credentials',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    schema: {
      example: {
        message: [
          'Please provide a valid email address',
          'Password is required',
        ],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiBody({ type: SignInDto })
  @HttpCode(HttpStatus.OK)
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile (For testing)' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      example: {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        bio: 'A short bio',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard)
  getProfile(@Request() req: AuthenticatedRequest) {
    return req.user;
  }
}
