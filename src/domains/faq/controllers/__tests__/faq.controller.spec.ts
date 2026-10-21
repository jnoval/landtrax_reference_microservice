import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { FAQController } from '../faq.controller';
import { FAQService } from '../../services/faq.service';

describe('FAQController', () => {
  let controller: FAQController;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      create: jest.fn().mockResolvedValue({ success: true, message: 'Created' }),
      findActive: jest.fn().mockResolvedValue([{ id: 'faq-1', title: 'Q1' }]),
      findAll: jest.fn().mockResolvedValue({ data: [], meta: {} }),
      findOne: jest.fn().mockResolvedValue({ id: 'faq-1', title: 'Q1' }),
      bulkUpdateStatus: jest.fn().mockResolvedValue({ success: true, message: 'Bulk status updated' }),
      bulkDelete: jest.fn().mockResolvedValue({ success: true, message: 'Bulk deleted' }),
      updateStatus: jest.fn().mockResolvedValue({ success: true, message: 'Status updated' }),
      update: jest.fn().mockResolvedValue({ success: true, message: 'Updated' }),
      delete: jest.fn().mockResolvedValue({ success: true, message: 'Deleted' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FAQController],
      providers: [
        { provide: FAQService, useValue: mockService },
        Reflector,
      ],
    }).compile();

    controller = module.get<FAQController>(FAQController);
  });

  it('delegates create to service', async () => {
    const res = await controller.create({ userId: 'u1' } as any, { title: 'Q1', content: 'A1' });
    expect(res.success).toBe(true);
    expect(mockService.create).toHaveBeenCalledWith({ title: 'Q1', content: 'A1' }, 'u1');
  });

  it('delegates getActiveFaqs to service', async () => {
    const res = await controller.getActiveFaqs('password');
    expect(res.length).toBe(1);
    expect(mockService.findActive).toHaveBeenCalledWith('password');
  });

  it('delegates update to service', async () => {
    const res = await controller.update({ userId: 'u1' } as any, 'faq-1', { title: 'Q2' });
    expect(res.success).toBe(true);
    expect(mockService.update).toHaveBeenCalledWith('faq-1', { title: 'Q2' }, 'u1');
  });

  it('delegates delete to service', async () => {
    const res = await controller.delete({ userId: 'u1' } as any, 'faq-1');
    expect(res.success).toBe(true);
    expect(mockService.delete).toHaveBeenCalledWith('faq-1', 'u1');
  });
});
