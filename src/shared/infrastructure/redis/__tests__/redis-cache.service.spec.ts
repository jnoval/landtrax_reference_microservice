import { ConfigService } from '@nestjs/config';
import { RedisCacheService } from '../redis-cache.service';

describe('RedisCacheService', () => {
  let service: RedisCacheService;
  let mockConfigService: any;

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn().mockImplementation((key) => {
        if (key === 'redis.host') return 'localhost';
        if (key === 'redis.port') return 6379;
        return undefined;
      }),
    };

    service = new RedisCacheService(mockConfigService);
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  it('handles get/set/del when client is disconnected gracefully', async () => {
    (service as any).isConnected = false;
    const res = await service.get('test-key');
    expect(res).toBeNull();

    await expect(service.set('test-key', { a: 1 })).resolves.not.toThrow();
    await expect(service.del('test-key')).resolves.not.toThrow();
    await expect(service.delPattern('test-*')).resolves.not.toThrow();
  });

  it('performs get, set, del when client is connected', async () => {
    const mockClient = {
      get: jest.fn().mockResolvedValue(JSON.stringify({ value: 'foo' })),
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
      keys: jest.fn().mockResolvedValue(['test-1', 'test-2']),
      quit: jest.fn().mockResolvedValue('OK'),
    };
    (service as any).client = mockClient;
    (service as any).isConnected = true;

    const data = await service.get<{ value: string }>('test-key');
    expect(data?.value).toBe('foo');

    await service.set('test-key', { value: 'bar' }, 60);
    expect(mockClient.set).toHaveBeenCalledWith('test-key', JSON.stringify({ value: 'bar' }), 'EX', 60);

    await service.set('test-key-no-ttl', { value: 'bar' });
    expect(mockClient.set).toHaveBeenCalledWith('test-key-no-ttl', JSON.stringify({ value: 'bar' }));

    await service.del('test-key');
    expect(mockClient.del).toHaveBeenCalledWith('test-key');

    await service.delPattern('test-*');
    expect(mockClient.keys).toHaveBeenCalledWith('test-*');
    expect(mockClient.del).toHaveBeenCalledWith('test-1', 'test-2');
  });
});
