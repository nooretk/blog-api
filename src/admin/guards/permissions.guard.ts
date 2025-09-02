import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      REQUIRE_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const { user } = request;

    if (!user) {
      this.logger.warn('Access denied: No authenticated user found');
      throw new ForbiddenException('Authentication required');
    }

    if (!user.roles || user.roles.length === 0) {
      this.logger.warn(`Access denied: User ${user.id} has no roles assigned`);
      throw new ForbiddenException('No user roles assigned');
    }

    const userPermissions: string[] = user.roles.flatMap(
      (role) => role.permissions?.map((permission) => permission.name) || [],
    );

    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );

    if (hasPermission) {
      this.logger.log(
        `Access granted: User ${user.id} has required permissions [${requiredPermissions.join(', ')}]`,
      );
      return true;
    }

    this.logger.warn(
      `Access denied: User ${user.id} lacks required permissions [${requiredPermissions.join(', ')}]. User has: [${userPermissions.join(', ')}]`,
    );
    throw new ForbiddenException(
      `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
    );
  }
}
