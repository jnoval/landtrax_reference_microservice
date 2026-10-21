import { SetMetadata } from '@nestjs/common';

export const AUDIT_RESOURCE_KEY = 'audit_resource';
export const Audit = (resource: string) => SetMetadata(AUDIT_RESOURCE_KEY, resource);
