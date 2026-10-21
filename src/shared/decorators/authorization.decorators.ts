import { SetMetadata } from '@nestjs/common';

export const PermissionRequired = (permission: string) => SetMetadata('permission', permission);
export const AnyPermission = (...permissions: string[]) => SetMetadata('anyPermission', permissions);
export const RateLimited = (limit = 100, windowMs = 900000) =>
  SetMetadata('rateLimit', { limit, windowMs });
