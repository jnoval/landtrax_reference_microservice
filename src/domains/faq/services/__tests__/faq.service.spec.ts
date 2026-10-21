import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import FAQEntity from 'src/shared/infrastructure/database/entities/faq.entity';
import { FAQService } from '../faq.service';

describe('FAQService', () => {
  let service: FAQService;
  let mockRepo: any;

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn((dto) => ({ id: 'faq-1', ...dto })),
      save: jest.fn((e) => Promise.resolve({ id: 'faq-1', ...e })),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FAQService,
        { provide: getRepositoryToken(FAQEntity), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<FAQService>(FAQService);
  });

  describe('create', () => {
    it('creates FAQ successfully when title is unique', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const res = await service.create(
        { title: 'How to register?', content: 'Click register.' },
        'user-1',
      );

      expect(res.success).toBe(true);
      expect(res.data?.title).toBe('How to register?');
      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('rejects duplicate FAQ title', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 'existing', title: 'How to register?' });

      await expect(
        service.create({ title: 'How to register?' }, 'user-1'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('returns FAQ by id', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 'faq-1', title: 'Test FAQ' });

      const res = await service.findOne('faq-1');
      expect(res.title).toBe('Test FAQ');
    });

    it('throws NotFoundException when FAQ not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('faq-404')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update & status', () => {
    it('updates FAQ', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 'faq-1', title: 'Old Title' });

      const res = await service.update('faq-1', { content: 'New Content' }, 'user-1');
      expect(res.success).toBe(true);
      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('updates FAQ status', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 'faq-1', isActive: true });

      const res = await service.updateStatus('faq-1', false, 'user-1');
      expect(res.success).toBe(true);
      expect(res.data?.isActive).toBe(false);
      expect(mockRepo.save).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('soft deletes FAQ', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 'faq-1', deletedDate: null });

      const res = await service.delete('faq-1', 'user-1');
      expect(res.success).toBe(true);
      expect(mockRepo.save).toHaveBeenCalled();
    });
  });
});
