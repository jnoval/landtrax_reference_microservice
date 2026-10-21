import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class GatewayUserGuard implements CanActivate {
  private readonly _logger = new Logger(GatewayUserGuard.name);
  private static readonly SANITIZE_PATTERN = /<[^>]*>|[<>"'`]/g;

  constructor(protected readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const gatewaySecret = request.headers['x-gateway-secret'];
    const expectedSecret = process.env.GATEWAY_SECRET;

    if (!gatewaySecret || gatewaySecret !== expectedSecret) {
      this._logger.warn(`Rejected request — invalid or missing x-gateway-secret from ${request.ip}`);
      throw new UnauthorizedException('Request must come through the API Gateway.');
    }

    const rawUserId = request.headers['x-user-id'];
    const rawUserRole = request.headers['x-user-role'];
    const rawUserType = request.headers['x-user-type'];

    if (!rawUserId) {
      throw new UnauthorizedException('Missing x-user-id header.');
    }

    request.user = {
      id: this.sanitize(String(rawUserId)),
      role: this.sanitize(String(rawUserRole ?? '')),
      type: this.sanitize(String(rawUserType ?? '')),
    };

    return true;
  }

  private sanitize(value: string): string {
    return value.replace(GatewayUserGuard.SANITIZE_PATTERN, '').substring(0, 256);
  }
}
