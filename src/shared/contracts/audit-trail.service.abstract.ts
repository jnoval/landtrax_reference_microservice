export abstract class AuditTrailService {
  abstract getUserAuditTrail(userId: string, ...args: any[]): Promise<any>;

  abstract create(dto: {
    userId?: string;
    action: string;
    entity?: string;
    details?: string;
    result?: string;
    ip?: string;
  }): Promise<any>;
}
