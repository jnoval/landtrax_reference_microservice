import { Injectable } from '@nestjs/common';
import { REFERENCE_MICROSERVICE_VERSION } from './config/app-version.config';

@Injectable()
export class AppService {
  getHealth(): { status: string; service: string; version: string; timestamp: string } {
    return {
      status: 'ok',
      service: 'reference-microservice',
      version: REFERENCE_MICROSERVICE_VERSION,
      timestamp: new Date().toISOString(),
    };
  }
}
