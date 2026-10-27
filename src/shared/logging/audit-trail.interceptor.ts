import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  NestInterceptor,
  Optional,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditTrailService } from '../contracts/audit-trail.service.abstract';
import { AUDIT_DESCRIPTION_KEY } from '../decorators/audit-description.decorator';
import { AUDIT_RESOURCE_KEY } from '../decorators/audit.decorator';

@Injectable()
export class AuditTrailInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditTrailInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    @Optional()
    @Inject(AuditTrailService)
    private readonly auditTrailService?: AuditTrailService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const handler = context.getHandler();
    const targetClass = context.getClass();

    const resource =
      this.reflector.get<string>(AUDIT_RESOURCE_KEY, handler) ||
      this.reflector.get<string>(AUDIT_RESOURCE_KEY, targetClass);

    const descriptionTemplate = this.reflector.get<string>(
      AUDIT_DESCRIPTION_KEY,
      handler,
    );

    if (!resource && !descriptionTemplate) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      tap((response) => {
        if (!this.auditTrailService) return;

        try {
          const rawUserId = request.user?.id || request.headers?.['x-user-id'] || null;
          const userId =
            !rawUserId || String(rawUserId).toLowerCase() === 'system'
              ? null
              : String(rawUserId);
          const ip = request.ip || request.connection?.remoteAddress || '127.0.0.1';
          const entity = resource || 'Reference';
          const action = request.method
            ? this.mapToAuditAction(request.method, request.url || '')
            : handler.name;

          let details = descriptionTemplate || `${action} performed on ${entity}`;
          const responseData =
            response && typeof response === 'object'
              ? response.data && typeof response.data === 'object' && !Array.isArray(response.data)
                ? { ...response, ...response.data }
                : response
              : {};

          const metadata: Record<string, any> = {
            ...responseData,
            ...(request.body || {}),
            ...(request.params || {}),
            ...(request.auditMetadata || {}),
          };

          if (details.includes('{identifier}') && !metadata.identifier) {
            const inferredId = this.searchForIdentifier(metadata);
            if (inferredId) {
              metadata.identifier = inferredId;
            }
          }

          for (const [key, value] of Object.entries(metadata)) {
            if (typeof value === 'string' || typeof value === 'number') {
              details = details.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
            }
          }

          this.auditTrailService.create({
            userId: userId as any,
            action,
            entity,
            details,
            result: 'SUCCESS',
            ip,
          });
        } catch (err: any) {
          this.logger.debug(`Audit trail recording skipped: ${err?.message}`);
        }
      }),
    );
  }

  private mapToAuditAction(method: string, url: string): string {
    if (method.toUpperCase() === 'POST' && /(^|\/)requirement$/.test(url)) {
      return 'CREATE_REQUIREMENT_CONFIGURATION';
    }
    if (method.toUpperCase() === 'PATCH' && /(^|\/)requirement\/(?!bulk)[^/]+$/.test(url)) {
      return 'UPDATE_REQUIREMENT_CONFIGURATION';
    }
    switch (method.toUpperCase()) {
      case 'POST':
        return 'CREATE';
      case 'PUT':
      case 'PATCH':
        return 'UPDATE';
      case 'DELETE':
        return 'DELETE';
      case 'GET':
      default:
        return 'VIEWED';
    }
  }

  private searchForIdentifier(obj: Record<string, any>): string | null {
    if (!obj || typeof obj !== 'object') return null;
    const keys = [
      'name',
      'title',
      'requirementCode',
      'code',
      'identifier',
      'label',
      'description',
      'slug',
    ];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    for (const key of keys) {
      const val = obj[key];
      if (val && typeof val === 'string' && !uuidRegex.test(val)) {
        return val;
      }
    }
    return null;
  }
}
