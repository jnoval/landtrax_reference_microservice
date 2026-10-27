import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { AuditTrailService } from '../../contracts/audit-trail.service.abstract';
import { AuditTrailHttpClient } from './audit-trail-http.client';

@Global()
@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 3,
    }),
  ],
  providers: [
    { provide: AuditTrailService, useClass: AuditTrailHttpClient },
    AuditTrailHttpClient,
  ],
  exports: [AuditTrailService],
})
export class InternalHttpModule {}
