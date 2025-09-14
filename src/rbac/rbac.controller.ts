import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AssignRoleDto } from './dto/assign-role.dto';
import { RequirePermissions } from './decorators/require-permissions.decorator';
import { PermissionsGuard } from './guards/permissions.guard';
import { AuthGuard } from '../auth/auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { RbacService } from './rbac.service';

@ApiTags('RBAC Role Management')
@ApiSecurity('JWT-auth')
@ApiBearerAuth('JWT-auth')
@Controller('rbac')
@UseGuards(AuthGuard, PermissionsGuard)
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Post('assign-role')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('assign_role')
  @ApiOperation({
    summary: 'Assign a role to a user',
    description:
      'Assigns a specific role to a user. Requires admin privileges with assign_role permission.',
  })
  @ApiBody({
    type: AssignRoleDto,
    description: 'User ID and role name to assign',
    examples: {
      'assign-admin': {
        summary: 'Assign admin role',
        value: { userId: 1, roleName: 'admin' },
      },
      'assign-user': {
        summary: 'Assign user role',
        value: { userId: 2, roleName: 'user' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Role assigned successfully',
    schema: {
      example: {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        roles: [
          { id: 1, name: 'user', description: 'Normal user' },
          { id: 2, name: 'admin', description: 'Administrator' },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - User already has this role or validation error',
    schema: {
      example: {
        message: 'User already has this role',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid authentication token',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions (requires assign_role permission)',
    schema: {
      example: {
        message: 'Insufficient permissions',
        error: 'Forbidden',
        statusCode: 403,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - User or role does not exist',
    schema: {
      example: {
        message: 'User not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  async assignRole(@Body() dto: AssignRoleDto) {
    return await this.rbacService.assignRole(dto.userId, dto.roleName);
  }

  @Post('revoke-role')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('assign_role')
  @ApiOperation({
    summary: 'Revoke a role from a user',
    description:
      'Removes a specific role from a user. Requires admin privileges with assign_role permission.',
  })
  @ApiBody({
    type: AssignRoleDto,
    description: 'User ID and role name to revoke',
    examples: {
      'revoke-admin': {
        summary: 'Revoke admin role',
        value: { userId: 1, roleName: 'admin' },
      },
      'revoke-user': {
        summary: 'Revoke user role',
        value: { userId: 2, roleName: 'user' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Role revoked successfully',
    schema: {
      example: {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        roles: [{ id: 1, name: 'user', description: 'Normal user' }],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid authentication token',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions (requires assign_role permission)',
    schema: {
      example: {
        message: 'Insufficient permissions',
        error: 'Forbidden',
        statusCode: 403,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - User or role does not exist',
    schema: {
      example: {
        message: 'Role not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  async revokeRole(@Body() dto: AssignRoleDto) {
    return await this.rbacService.revokeRole(dto.userId, dto.roleName);
  }
}
