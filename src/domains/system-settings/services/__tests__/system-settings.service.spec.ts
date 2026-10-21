import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import SystemSettingEntity from 'src/shared/infrastructure/database/entities/system-setting.entity';
import { RedisCacheService } from 'src/shared/infrastructure/redis/redis-cache.service';
import { SystemSettingsService } from '../system-settings.service';

describe('SystemSettingsService', () => {
  let service: SystemSettingsService;
  let mockRepo: any;
  let mockRedis: any;

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn((dto) => ({ id: 'set-1', ...dto })),
      save: jest.fn((e) => Promise.resolve({ id: 'set-1', ...e })),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SystemSettingsService,
        { provide: getRepositoryToken(SystemSettingEntity), useValue: mockRepo },
        { provide: RedisCacheService, useValue: mockRedis },
      ],
    }).compile();

    service = module.get<SystemSettingsService>(SystemSettingsService);
  });

  describe('getByKey', () => {
    it('returns cached value when cache hit occurs in Redis', async () => {
      mockRedis.get.mockResolvedValue({ id: 'set-1', key: 'app.name', value: 'LandTrax' });

      const res = await service.getByKey('app.name');
      expect(res.value).toBe('LandTrax');
      expect(mockRedis.get).toHaveBeenCalledWith('system_setting:app.name');
      expect(mockRepo.findOne).not.toHaveBeenCalled();
    });

    it('queries DB and caches result when cache miss occurs', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRepo.findOne.mockResolvedValue({ id: 'set-1', key: 'app.name', value: 'LandTrax' });

      const res = await service.getByKey('app.name');
      expect(res.value).toBe('LandTrax');
      expect(mockRedis.set).toHaveBeenCalledWith(
        'system_setting:app.name',
        expect.objectContaining({ key: 'app.name' }),
        600,
      );
    });

    it('throws NotFoundException when key does not exist', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.getByKey('missing.key')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates setting and invalidates cache', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const res = await service.create('user-1', {
        key: 'security.requireMFA',
        name: 'Require MFA',
        value: 'true',
      });

      expect(res.success).toBe(true);
      expect(mockRepo.save).toHaveBeenCalled();
      expect(mockRedis.del).toHaveBeenCalledWith('system_setting:security.requireMFA');
    });

    it('rejects duplicate setting key', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 'existing', key: 'dup.key' });

      await expect(
        service.create('user-1', {
          key: 'dup.key',
          name: 'Duplicate',
          value: 'val',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update & delete', () => {
    it('updates setting and clears cache', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 'set-1', key: 'app.name', value: 'Old' });

      const res = await service.update('user-1', 'set-1', { value: 'New' });
      expect(res.success).toBe(true);
      expect(mockRepo.save).toHaveBeenCalled();
      expect(mockRedis.del).toHaveBeenCalledWith('system_setting:app.name');
    });

    it('soft deletes setting and clears cache', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 'set-1', key: 'app.name' });

      const res = await service.delete('set-1', 'user-1');
      expect(res.success).toBe(true);
      expect(mockRepo.save).toHaveBeenCalled();
      expect(mockRedis.del).toHaveBeenCalledWith('system_setting:app.name');
    });
  });
});
