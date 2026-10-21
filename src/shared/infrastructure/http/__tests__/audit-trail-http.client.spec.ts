import { of } from 'rxjs';
import { AuditTrailHttpClient } from '../audit-trail-http.client';

describe('AuditTrailHttpClient', () => {
  let client: AuditTrailHttpClient;
  let mockHttpService: any;

  beforeEach(() => {
    mockHttpService = {
      post: jest.fn().mockReturnValue(of({ data: { success: true } })),
    };
    client = new AuditTrailHttpClient(mockHttpService);
  });

  it('skips writing when MONOLITH_BASE_URL is not set', async () => {
    delete process.env.MONOLITH_BASE_URL;
    const res = await client.create({ action: 'CREATE', entity: 'Service' });
    expect(res).toEqual({ success: true, skipped: true });
    expect(mockHttpService.post).not.toHaveBeenCalled();
  });

  it('posts to internal endpoint when MONOLITH_BASE_URL is set', async () => {
    process.env.MONOLITH_BASE_URL = 'http://localhost:3000';
    process.env.APP_AUTH = 'test-secret';

    const res = await client.create({ action: 'CREATE', entity: 'Service' });
    expect(res).toEqual({ success: true });
    expect(mockHttpService.post).toHaveBeenCalledWith(
      'http://localhost:3000/internal/audit-trail',
      expect.objectContaining({ action: 'CREATE' }),
      expect.objectContaining({ headers: { 'x-internal-secret': 'test-secret' } }),
    );
  });

  it('throws on getUserAuditTrail', () => {
    expect(() => client.getUserAuditTrail('u1')).toThrow('Method not implemented.');
  });
});
