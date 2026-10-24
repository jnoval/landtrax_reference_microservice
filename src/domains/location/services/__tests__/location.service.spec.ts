import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LocationEntity } from 'src/shared/infrastructure/database/entities/location.entity';
import { RedisCacheService } from 'src/shared/infrastructure/redis/redis-cache.service';
import { LocationService } from '../location.service';

describe('LocationService', () => {
  let service: LocationService;
  let mockRepo: any;
  let mockRedis: any;

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn((dto) => ({ id: 'loc-1', ...dto })),
      save: jest.fn((e) => Promise.resolve({ id: 'loc-1', ...e })),
      findOne: jest.fn(),
      find: jest.fn(),
      query: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        { provide: getRepositoryToken(LocationEntity), useValue: mockRepo },
        { provide: RedisCacheService, useValue: mockRedis },
      ],
    }).compile();

    service = module.get<LocationService>(LocationService);
  });

  describe('create', () => {
    it('creates location and clears active cache', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const res = await service.create(
        {
          name: 'Quezon City RD',
          abbreviation: 'QCRD',
          address: 'QC Hall',
          isActive: true,
        },
        'user-1',
      );

      expect(res.success).toBe(true);
      expect(mockRepo.save).toHaveBeenCalled();
      expect(mockRedis.del).toHaveBeenCalledWith('location:active');
    });

    it('rejects duplicate location name', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 'existing', name: 'Manila RD' });

      await expect(
        service.create(
          {
            name: 'Manila RD',
            isActive: true,
          },
          'user-1',
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAllActive', () => {
    it('returns cached active locations on cache hit', async () => {
      mockRedis.get.mockResolvedValue([{ id: 'loc-1', name: 'QC RD', isActive: true }]);

      const res = await service.findAllActive();
      expect(res.length).toBe(1);
      expect(mockRedis.get).toHaveBeenCalledWith('location:active');
      expect(mockRepo.find).not.toHaveBeenCalled();
    });

    it('fetches from DB and populates cache on miss', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRepo.find.mockResolvedValue([{ id: 'loc-1', name: 'QC RD', isActive: true }]);

      const res = await service.findAllActive();
      expect(res.length).toBe(1);
      expect(mockRedis.set).toHaveBeenCalledWith(
        'location:active',
        expect.any(Array),
        600,
      );
    });
  });

  describe('update & status', () => {
    it('updates location and invalidates cache', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 'loc-1', name: 'Old RD' });

      const res = await service.update('loc-1', { abbreviation: 'NEW' }, 'user-1');
      expect(res.success).toBe(true);
      expect(mockRepo.save).toHaveBeenCalled();
      expect(mockRedis.del).toHaveBeenCalled();
    });

    it('toggles active status', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 'loc-1', isActive: true });

      const res = await service.updateStatus('loc-1', 'user-1');
      expect(res.success).toBe(true);
      expect(res.data?.isActive).toBe(false);
      expect(mockRedis.del).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('soft deletes location and invalidates cache', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 'loc-1', name: 'QC RD' });

      const res = await service.remove('loc-1', 'user-1');
      expect(res.success).toBe(true);
      expect(mockRepo.save).toHaveBeenCalled();
      expect(mockRedis.del).toHaveBeenCalled();
    });
  });
});
