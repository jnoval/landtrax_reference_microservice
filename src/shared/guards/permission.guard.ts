import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GatewayUserGuard } from './gateway-user.guard';

@Injectable()
export class PermissionGuard extends GatewayUserGuard implements CanActivate {
  private readonly _permLogger = new Logger(PermissionGuard.name);

  constructor(reflector: Reflector) {
    super(reflector);
  }

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
    if (isPublic) {
      return true;
    }

    super.canActivate(context);

    const request = context.switchToHttp().getRequest();
    const required =
      this.reflector.get<string>('permission', context.getHandler()) ??
      this.reflector.get<string[]>('anyPermission', context.getHandler());

    if (!required) return true;

    const rawRole = String(request.user?.role ?? request.headers['x-user-role'] ?? '');
    const isAdmin =
      rawRole === 'System Admin' ||
      rawRole === 'Super Admin' ||
      rawRole.toLowerCase() === 'system admin' ||
      rawRole.toLowerCase() === 'super admin';

    if (isAdmin) {
      return true;
    }

    const rawPermissions = request.headers['x-user-permissions'] ?? '';
    const permissions = new Set(
      String(rawPermissions)
        .split(',')
        .map((p) => p.trim()),
    );

    const requiredArr = Array.isArray(required) ? required : [required];
    const hasPermission = requiredArr.some((p) => permissions.has(p));

    if (!hasPermission) {
      this._permLogger.warn(
        `Permission denied for user ${request.user?.id}. Required: ${requiredArr.join(',')}`,
      );
      throw new ForbiddenException('You do not have permission to perform this action.');
    }
    return true;
  }
}
