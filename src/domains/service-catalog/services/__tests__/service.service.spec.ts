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
    it('returns service when found', async () => {
      mockServiceRepo.findOne.mockResolvedValue({ id: 'svc-1', name: 'Title Search' });

      const res = await service.findOne('svc-1');
      expect(res.success).toBe(true);
      expect(res.data?.id).toBe('svc-1');
    });

    it('throws NotFoundException when not found', async () => {
      mockServiceRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates service successfully', async () => {
      mockServiceRepo.findOne
        .mockResolvedValueOnce({ id: 'svc-1', name: 'Old Title' })
        .mockResolvedValueOnce(null);

      const res = await service.update('user-1', 'svc-1', { name: 'New Title' });
      expect(res.success).toBe(true);
      expect(mockServiceRepo.save).toHaveBeenCalled();
    });

    it('throws BadRequestException if new name conflicts', async () => {
      mockServiceRepo.findOne
        .mockResolvedValueOnce({ id: 'svc-1', name: 'Old Title' })
        .mockResolvedValueOnce({ id: 'svc-2', name: 'New Title' });

      await expect(service.update('user-1', 'svc-1', { name: 'New Title' })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateStatus', () => {
    it('updates active status', async () => {
      mockServiceRepo.findOne.mockResolvedValue({ id: 'svc-1', isActive: true });

      const res = await service.updateStatus('svc-1', { isActive: false });
      expect(res.success).toBe(true);
      expect(mockServiceRepo.save).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('soft deletes service', async () => {
      mockServiceRepo.findOne.mockResolvedValue({ id: 'svc-1', deletedDate: null });

      const res = await service.delete('svc-1');
      expect(res.success).toBe(true);
      expect(mockServiceRepo.save).toHaveBeenCalled();
    });
  });
});
