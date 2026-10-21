import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { RequirementController } from '../requirement.controller';
import { RequirementService } from '../../services/requirement.service';

describe('RequirementController', () => {
  let controller: RequirementController;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      create: jest.fn().mockResolvedValue({ success: true, message: 'Created' }),
      findAll: jest.fn().mockResolvedValue({ success: true, data: [] }),
      findByCode: jest.fn().mockResolvedValue({ success: true, data: { id: 'req-1' } }),
      findOne: jest.fn().mockResolvedValue({ success: true, data: { id: 'req-1' } }),
      bulkUpdateStatus: jest.fn().mockResolvedValue({ success: true, message: 'Bulk status updated' }),
      bulkDelete: jest.fn().mockResolvedValue({ success: true, message: 'Bulk deleted' }),
      updateStatus: jest.fn().mockResolvedValue({ success: true, message: 'Status updated' }),
      update: jest.fn().mockResolvedValue({ success: true, message: 'Updated' }),
      delete: jest.fn().mockResolvedValue({ success: true, message: 'Deleted' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequirementController],
      providers: [
        { provide: RequirementService, useValue: mockService },
        Reflector,
      ],
    }).compile();

    controller = module.get<RequirementController>(RequirementController);
  });

  it('delegates create to service', async () => {
    const res = await controller.create({ userId: 'u1' } as any, { name: 'Req 1', type: 'DOCUMENT' } as any);
    expect(res.success).toBe(true);
    expect(mockService.create).toHaveBeenCalledWith('u1', { name: 'Req 1', type: 'DOCUMENT' });
  });

  it('delegates findByCode to service', async () => {
    const res = await controller.findByCode('CODE-1');
    expect(res.success).toBe(true);
    expect(mockService.findByCode).toHaveBeenCalledWith('CODE-1');
  });

  it('delegates bulkUpdateStatus to service', async () => {
    const res = await controller.bulkUpdateStatus({ ids: ['r1'], isActive: true });
    expect(res.success).toBe(true);
    expect(mockService.bulkUpdateStatus).toHaveBeenCalled();
  });

  it('delegates delete to service', async () => {
    const res = await controller.delete('r1');
    expect(res.success).toBe(true);
    expect(mockService.delete).toHaveBeenCalledWith('r1');
  });
});
