import { BadRequestException, HttpException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoryEntity } from 'src/shared/infrastructure/database/entities/category.entity';
import ServiceEntity from 'src/shared/infrastructure/database/entities/service-catalog.entity';
import { ServiceCatalogService } from '../service.service';

describe('ServiceCatalogService', () => {
  let service: ServiceCatalogService;
  let mockServiceRepo: any;
  let mockCategoryRepo: any;

  beforeEach(async () => {
    mockServiceRepo = {
      create: jest.fn((dto) => ({ id: 'mock-id', ...dto })),
      save: jest.fn((entity) => Promise.resolve({ id: 'mock-id', ...entity })),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    mockCategoryRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceCatalogService,
        { provide: getRepositoryToken(ServiceEntity), useValue: mockServiceRepo },
        { provide: getRepositoryToken(CategoryEntity), useValue: mockCategoryRepo },
      ],
    }).compile();

    service = module.get<ServiceCatalogService>(ServiceCatalogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates a new service catalog offering when name is unique', async () => {
      mockServiceRepo.findOne.mockResolvedValue(null);

      const res = await service.create('user-1', {
        name: 'Title Search',
        serviceCode: 'TS-01',
        type: 'Transfer',
        categoryId: 'cat-1',
        price: 1500,
        turnaroundDays: 3,
      });

      expect(res.success).toBe(true);
      expect(res.data?.name).toBe('Title Search');
      expect(mockServiceRepo.save).toHaveBeenCalled();
    });

    it('throws error when service catalog name already exists', async () => {
      mockServiceRepo.findOne.mockResolvedValue({ id: 'existing-id', name: 'Title Search' });

      await expect(
        service.create('user-1', {
          name: 'Title Search',
          serviceCode: 'TS-01',
          type: 'Transfer',
          categoryId: 'cat-1',
          price: 1500,
          turnaroundDays: 3,
        }),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('findOne', () => {
    const validId = 'a0000000-0000-0000-0000-000000000001';
    const nonExistentId = 'a0000000-0000-0000-0000-000000000002';

    it('returns service when found', async () => {
      mockServiceRepo.findOne.mockResolvedValue({ id: validId, name: 'Title Search' });

      const res = await service.findOne(validId);
      expect(res.success).toBe(true);
      expect(res.data?.id).toBe(validId);
    });

    it('throws NotFoundException when not found', async () => {
      mockServiceRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(nonExistentId)).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException immediately when id is invalid UUID', async () => {
      await expect(service.findOne('invalid-uuid')).rejects.toThrow(NotFoundException);
      expect(mockServiceRepo.findOne).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const validId = 'a0000000-0000-0000-0000-000000000001';

    it('updates service successfully', async () => {
      mockServiceRepo.findOne
        .mockResolvedValueOnce({ id: validId, name: 'Old Title' })
        .mockResolvedValueOnce(null);

      const res = await service.update('user-1', validId, { name: 'New Title' });
      expect(res.success).toBe(true);
      expect(mockServiceRepo.save).toHaveBeenCalled();
    });

    it('throws BadRequestException if new name conflicts', async () => {
      mockServiceRepo.findOne
        .mockResolvedValueOnce({ id: validId, name: 'Old Title' })
        .mockResolvedValueOnce({ id: 'a0000000-0000-0000-0000-000000000002', name: 'New Title' });

      await expect(service.update('user-1', validId, { name: 'New Title' })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateStatus', () => {
    const validId = 'a0000000-0000-0000-0000-000000000001';

    it('updates active status', async () => {
      mockServiceRepo.findOne.mockResolvedValue({ id: validId, isActive: true });

      const res = await service.updateStatus(validId, { isActive: false });
      expect(res.success).toBe(true);
      expect(mockServiceRepo.save).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    const validId = 'a0000000-0000-0000-0000-000000000001';

    it('soft deletes service', async () => {
      mockServiceRepo.findOne.mockResolvedValue({ id: validId, deletedDate: null });

      const res = await service.delete(validId);
      expect(res.success).toBe(true);
      expect(mockServiceRepo.save).toHaveBeenCalled();
    });
  });
});
