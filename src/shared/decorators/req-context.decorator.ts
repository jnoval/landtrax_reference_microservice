import {
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';

export class RequestContextDto {
  ip!: string;
  userAgent!: string;
  userId!: string;
  auditMetadata?: Record<string, string>;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
  user?: { id: string; role?: string; type?: string };
  originalUrl?: string;
}

export const ReqContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RequestContextDto => {
    const request = ctx.switchToHttp().getRequest();

    const ipAddress =
      request.ip || request.connection?.remoteAddress || '127.0.0.1';
    const userAgent = request.headers['user-agent'] || 'Unknown';
    const userId = request.user?.id || (request.headers['x-user-id'] as string) || 'system';

    return {
      ip: ipAddress,
      userAgent,
      userId,
      cookies: request.cookies,
      user: request.user,
      headers: request.headers,
      originalUrl: request.originalUrl,
    } as RequestContextDto;
  },
);
