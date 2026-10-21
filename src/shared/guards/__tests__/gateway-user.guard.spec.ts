import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GatewayUserGuard } from '../gateway-user.guard';

describe('GatewayUserGuard', () => {
  let guard: GatewayUserGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new GatewayUserGuard(reflector);
    process.env.GATEWAY_SECRET = 'valid-secret';
  });

  const buildContext = (headers: Record<string, string>, isPublic = false) => {
    const req: any = { headers, ip: '127.0.0.1' };
    return {
      switchToHttp: () => ({ getRequest: () => req }),
      getHandler: () => ({}),
      getClass: () => ({}),
      _req: req,
    } as any;
  };

  it('allows public routes', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(true);
    const ctx = buildContext({});
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('rejects missing gateway secret', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(false);
    const ctx = buildContext({});
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('rejects invalid gateway secret', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(false);
    const ctx = buildContext({ 'x-gateway-secret': 'wrong-secret' });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('rejects missing user id header', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(false);
    const ctx = buildContext({ 'x-gateway-secret': 'valid-secret' });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('sanitizes and attaches user when secret and user id are valid', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(false);
    const ctx = buildContext({
      'x-gateway-secret': 'valid-secret',
      'x-user-id': 'user-123<script>',
      'x-user-role': 'Admin',
      'x-user-type': 'Internal',
    });

    expect(guard.canActivate(ctx)).toBe(true);
    expect(ctx._req.user).toEqual({
      id: 'user-123',
      role: 'Admin',
      type: 'Internal',
    });
  });
});
