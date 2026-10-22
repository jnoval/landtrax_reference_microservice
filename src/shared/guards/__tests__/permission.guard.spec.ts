import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionGuard } from '../permission.guard';

describe('PermissionGuard', () => {
  let guard: PermissionGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new PermissionGuard(reflector);
    process.env.GATEWAY_SECRET = 'valid-secret';
  });

  const buildContext = (headers: Record<string, string>, requiredPerm?: string | string[]) => {
    const req: any = { headers, ip: '127.0.0.1' };
    jest.spyOn(reflector, 'get').mockImplementation((key: string) => {
      if (key === 'isPublic') return false;
      if (key === 'permission') return typeof requiredPerm === 'string' ? requiredPerm : undefined;
      if (key === 'anyPermission') return Array.isArray(requiredPerm) ? requiredPerm : undefined;
      return undefined;
    });

    return {
      switchToHttp: () => ({ getRequest: () => req }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;
  };

  it('allows access when user possesses required permission', () => {
    const ctx = buildContext(
      {
        'x-gateway-secret': 'valid-secret',
        'x-user-id': 'u1',
        'x-user-permissions': 'Create Service Catalog,View Services Catalogs',
      },
      'Create Service Catalog',
    );

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('throws ForbiddenException when user lacks required permission', () => {
    const ctx = buildContext(
      {
        'x-gateway-secret': 'valid-secret',
        'x-user-id': 'u1',
        'x-user-permissions': 'View Services Catalogs',
      },
      'Delete Service Catalog',
    );

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('allows access when user has System Admin or Super Admin role', () => {
    const ctx = buildContext(
      {
        'x-gateway-secret': 'valid-secret',
        'x-user-id': 'u1',
        'x-user-role': 'System Admin',
        'x-user-permissions': '',
      },
      'Delete Service Catalog',
    );

    expect(guard.canActivate(ctx)).toBe(true);
  });
});
