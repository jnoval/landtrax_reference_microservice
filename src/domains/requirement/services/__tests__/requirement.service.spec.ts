import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import RequirementEntity from 'src/shared/infrastructure/database/entities/requirement.entity';
import { RequirementService } from '../requirement.service';

describe('RequirementService', () => {
  let service: RequirementService;
  let mockRepo: any;

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn((dto) => ({ id: 'req-1', ...dto })),
      save: jest.fn((e) => Promise.resolve({ id: 'req-1', ...e })),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequirementService,
        { provide: getRepositoryToken(RequirementEntity), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<RequirementService>(RequirementService);
  });

  describe('create', () => {
    it('creates requirement successfully', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const res = await service.create('user-1', {
        name: 'Land Title Transfer Document',
        type: 'DOCUMENT',
        fileNameFormat: '{Document Name}_{Date}',
        acceptedFileTypes: 'pdf,jpg',
        maxFileSize: 25,
        minFiles: 1,
        maxFiles: 5,
      });

      expect(res.success).toBe(true);
      expect(res.data?.name).toBe('Land Title Transfer Document');
      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('rejects duplicate requirement name', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 'existing', name: 'Land Title' });

      await expect(
        service.create('user-1', {
          name: 'Land Title',
          type: 'DOCUMENT',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('rejects invalid filename format tokens', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(
        service.create('user-1', {
          name: 'Valid Name',
          type: 'DOCUMENT',
          fileNameFormat: '{unknown_variable_xyz}',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne & findByCode', () => {
    it('returns requirement by id', async () => {
      const validId = 'a0000000-0000-0000-0000-000000000001';
      mockRepo.findOne.mockResolvedValue({ id: validId, name: 'Valid' });

      const res = await service.findOne(validId);
      expect(res.success).toBe(true);
      expect(res.data?.id).toBe(validId);
    });

    it('throws NotFoundException when requirement not found by id', async () => {
      const validId = 'a0000000-0000-0000-0000-000000000002';
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(validId)).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException immediately when id is an invalid UUID (e.g. "active")', async () => {
      await expect(service.findOne('active')).rejects.toThrow(NotFoundException);
      expect(mockRepo.findOne).not.toHaveBeenCalled();
    });

    it('returns requirement by code', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 'req-1', requirementCode: 'CODE-1' });

      const res = await service.findByCode('CODE-1');
      expect(res.success).toBe(true);
      expect(res.data?.requirementCode).toBe('CODE-1');
    });
  });

  describe('getActiveRequirements', () => {
    it('returns active requirements with pagination meta and applies filters', async () => {
      const mockQb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ id: 'a0000000-0000-0000-0000-000000000001', name: 'Tax Dec', isActive: true }]),
      };
      mockRepo.createQueryBuilder.mockReturnValue(mockQb);

      const res = await (service as any).getActiveRequirements(1, 10, 'Tax', {
        type: 'DOCUMENT',
        code: 'REQ-1',
      });

      expect(res.data).toHaveLength(1);
      expect(res.meta.total).toBe(1);
      expect(mockQb.andWhere).toHaveBeenCalledTimes(4);
    });
  });

  describe('updateStatus & bulkUpdate', () => {
    const validId = 'a0000000-0000-0000-0000-000000000001';

    it('updates status of a requirement', async () => {
      mockRepo.findOne.mockResolvedValue({ id: validId, isActive: false });

      const res = await service.updateStatus(validId, { isActive: true });
      expect(res.success).toBe(true);
      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('bulk updates requirement status', async () => {
      const mockQb = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        whereInIds: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 2 }),
      };
      mockRepo.createQueryBuilder.mockReturnValue(mockQb);

      const res = await service.bulkUpdateStatus({ ids: [validId], isActive: false });
      expect(res.success).toBe(true);
    });

    it('bulk deletes requirements', async () => {
      const mockQb = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        whereInIds: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      };
      mockRepo.createQueryBuilder.mockReturnValue(mockQb);

      const res = await service.bulkDelete({ ids: [validId] });
      expect(res.success).toBe(true);
    });
  });

  describe('update & delete', () => {
    const validId = 'a0000000-0000-0000-0000-000000000001';

    it('updates requirement', async () => {
      mockRepo.findOne.mockResolvedValue({ id: validId, name: 'Old' });

      const res = await service.update('user-1', validId, { description: 'Updated' });
      expect(res.success).toBe(true);
      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('soft deletes requirement', async () => {
      mockRepo.findOne.mockResolvedValue({ id: validId, deletedDate: null });

      const res = await service.delete(validId);
      expect(res.success).toBe(true);
      expect(mockRepo.save).toHaveBeenCalled();
    });
  });
});
