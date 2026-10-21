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
      mockRepo.findOne.mockResolvedValue({ id: 'req-1', name: 'Valid' });

      const res = await service.findOne('req-1');
      expect(res.success).toBe(true);
      expect(res.data?.id).toBe('req-1');
    });

    it('throws NotFoundException when requirement not found by id', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('req-404')).rejects.toThrow(NotFoundException);
    });

    it('returns requirement by code', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 'req-1', requirementCode: 'CODE-1' });

      const res = await service.findByCode('CODE-1');
      expect(res.success).toBe(true);
      expect(res.data?.requirementCode).toBe('CODE-1');
    });
  });

  describe('update & delete', () => {
    it('updates requirement', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 'req-1', name: 'Old' });

      const res = await service.update('user-1', 'req-1', { description: 'Updated' });
      expect(res.success).toBe(true);
      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('soft deletes requirement', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 'req-1', deletedDate: null });

      const res = await service.delete('req-1');
      expect(res.success).toBe(true);
      expect(mockRepo.save).toHaveBeenCalled();
    });
  });
});
