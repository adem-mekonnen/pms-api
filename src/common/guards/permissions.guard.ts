// src/common/guards/permissions.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

// Clean @common/* aliases:
import { PERMISSIONS_KEY } from '@common/decorators/permissions.decorator';
import { Permission } from '@common/enums/permissions.enum';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Read required permissions from the @RequirePermissions() decorator
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If the endpoint has no @RequirePermissions decorator, let them pass
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // 2. Get the authenticated user from the request
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User is not authenticated.');
    }

    // 3. In our unified identity model (BRD Section 44.6):
    // Defaults to full access for Organization Owner
    const userPermissions: string[] = user.permissions || ['*'];

    const hasAllRequired = requiredPermissions.every(
      (permission) =>
        userPermissions.includes('*') || userPermissions.includes(permission),
    );

    if (!hasAllRequired) {
      throw new ForbiddenException(
        `Access denied. Requires permissions: [${requiredPermissions.join(', ')}]`,
      );
    }

    return true;
  }
}