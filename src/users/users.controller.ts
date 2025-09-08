import {
  Controller,
  Patch,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiSecurity,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { PasswordUpdateResponseDto } from './dto/password-update-response.dto';
import { AuthGuard } from '../auth/auth.guard';

import { PERMISSIONS } from '../common/constants/permissions-and-roles';
import { PermissionsGuard } from 'src/rbac/guards/permissions.guard';
import { RequirePermissions } from 'src/rbac/decorators/require-permissions.decorator';

@ApiTags('User Profile Management')
@ApiSecurity('JWT-auth')
@ApiBearerAuth('JWT-auth')
@Controller('users/me')
@UseGuards(AuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PERMISSIONS.UPDATE_PROFILE_OWN)
  @ApiOperation({
    summary: 'Update user profile',
    description:
      "Update the authenticated user's profile information (name and bio)",
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: UserProfileResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data (validation errors)',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'Name must be at least 2 characters long',
          'Bio must not exceed 500 characters',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      },
    },
  })
  async updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserProfileResponseDto> {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  @Patch('password')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PERMISSIONS.UPDATE_PROFILE_OWN)
  @ApiOperation({
    summary: 'Update user password',
    description:
      "Update the authenticated user's password with a new secure password",
  })
  @ApiResponse({
    status: 200,
    description: 'Password updated successfully',
    type: PasswordUpdateResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid password format',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'Password must be at least 6 characters long',
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      },
    },
  })
  async updatePassword(
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdatePasswordDto,
  ): Promise<PasswordUpdateResponseDto> {
    return this.usersService.updatePassword(req.user.id, dto);
  }
}
