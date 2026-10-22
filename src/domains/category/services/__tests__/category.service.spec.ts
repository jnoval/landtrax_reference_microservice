import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoryEntity } from 'src/shared/infrastructure/database/entities/category.entity';
import { CategoryService } from '../category.service';

describe('CategoryService', () => {
  let service: CategoryService;
  let mockRepo: any;

  const validId = 'a0000000-0000-0000-0000-000000000001';
  const otherId = 'a0000000-0000-0000-0000-000000000002';

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn((dto) => ({ id: validId, ...dto })),
      save: jest.fn((e) => Promise.resolve({ id: validId, ...e })),
      findOne: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: getRepositoryToken(CategoryEntity), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

  describe('create', () => {
    it('creates category successfully when name is unique', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const res = await service.create(
        { name: 'Titling Services', colorHex: '#3B82F6' },
        'user-1',
      );

      expect(res.success).toBe(true);
      expect(res.data?.name).toBe('Titling Services');
      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('rejects duplicate category name with ConflictException', async () => {
      mockRepo.findOne.mockResolvedValue({ id: otherId, name: 'Titling Services' });

      await expect(
        service.create({ name: 'Titling Services', colorHex: '#3B82F6' }, 'user-1'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll & getAll', () => {
    it('returns paginated categories with meta', async () => {
      const mockQb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ id: validId, name: 'Titling' }]),
      };
      mockRepo.createQueryBuilder.mockReturnValue(mockQb);

      const res = await service.findAll(1, 10, 'Title');
      expect(res.data).toHaveLength(1);
      expect(res.meta.total).toBe(1);
      expect(mockQb.andWhere).toHaveBeenCalled();
    });

    it('returns all categories ordered by createdDate DESC', async () => {
      const mockQb = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          { id: validId, name: 'Titling' },
          { id: otherId, name: 'Documentation' },
        ]),
      };
      mockRepo.createQueryBuilder.mockReturnValue(mockQb);

      const res = await service.getAll();
      expect(Array.isArray(res)).toBe(true);
      expect(res).toHaveLength(2);
      expect(mockQb.orderBy).toHaveBeenCalledWith('category.createdDate', 'DESC');
    });
  });

  describe('findOne', () => {
    it('returns category with services relation when found', async () => {
      mockRepo.findOne.mockResolvedValue({ id: validId, name: 'Titling', services: [] });

      const res = await service.findOne(validId);
      expect(res.id).toBe(validId);
      expect(mockRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: validId }),
          relations: ['services'],
        }),
      );
    });

    it('throws NotFoundException when category not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(otherId)).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException immediately when id is not a valid UUID', async () => {
      await expect(service.findOne('invalid-uuid')).rejects.toThrow(NotFoundException);
      expect(mockRepo.findOne).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('updates category successfully', async () => {
      mockRepo.findOne
        .mockResolvedValueOnce({ id: validId, name: 'Old Name', colorHex: '#111111', services: [] })
        .mockResolvedValueOnce(null);

      const res = await service.update(
        validId,
        { name: 'Updated Name', colorHex: '#222222' },
        'user-1',
      );

      expect(res.success).toBe(true);
      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('rejects duplicate category name on update with ConflictException', async () => {
      mockRepo.findOne
        .mockResolvedValueOnce({ id: validId, name: 'Old Name', services: [] })
        .mockResolvedValueOnce({ id: otherId, name: 'Conflicting Name' });

      await expect(
        service.update(validId, { name: 'Conflicting Name' }, 'user-1'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('delete', () => {
    it('soft deletes category when no services are linked', async () => {
      mockRepo.findOne.mockResolvedValue({ id: validId, name: 'Titling', services: [] });

      const res = await service.delete(validId, 'user-1');
      expect(res.success).toBe(true);
      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('rejects deletion with ConflictException when category is in use by service catalog', async () => {
      mockRepo.findOne.mockResolvedValue({
        id: validId,
        name: 'Titling',
        services: [{ id: 'svc-1', name: 'Title Transfer' }],
      });

      await expect(service.delete(validId, 'user-1')).rejects.toThrow(ConflictException);
      expect(mockRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('findByName', () => {
    it('finds active category by name', async () => {
      mockRepo.findOne.mockResolvedValue({ id: validId, name: 'Titling' });

      const res = await service.findByName('Titling');
      expect(res?.id).toBe(validId);
    });
  });
});
