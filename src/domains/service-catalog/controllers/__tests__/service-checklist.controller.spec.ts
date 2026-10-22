import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ServiceChecklistController } from '../service-checklist.controller';
import { ServiceChecklistService } from '../../services/service-checklist.service';

describe('ServiceChecklistController', () => {
  let controller: ServiceChecklistController;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      create: jest.fn().mockResolvedValue({ success: true, message: 'Created' }),
      findAll: jest.fn().mockResolvedValue({ success: true, data: [] }),
      findByServiceId: jest.fn().mockResolvedValue({ success: true, data: [] }),
      findOne: jest.fn().mockResolvedValue({ success: true, data: { id: 'chk-1' } }),
      reorder: jest.fn().mockResolvedValue({ success: true, message: 'Reordered' }),
      update: jest.fn().mockResolvedValue({ success: true, message: 'Updated' }),
      delete: jest.fn().mockResolvedValue({ success: true, message: 'Deleted' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceChecklistController],
      providers: [
        { provide: ServiceChecklistService, useValue: mockService },
        Reflector,
      ],
    }).compile();

    controller = module.get<ServiceChecklistController>(ServiceChecklistController);
  });

  it('delegates create to service', async () => {
    const res = await controller.create({ serviceId: 's1', requirementId: 'r1', isRequired: true, sort: 1 });
    expect(res.success).toBe(true);
    expect(mockService.create).toHaveBeenCalled();
  });

  it('delegates findByServiceId to service', async () => {
    mockService.findByServiceId.mockResolvedValue([]);
    const res = await controller.findByServiceId('s1');
    expect(Array.isArray(res)).toBe(true);
    expect(mockService.findByServiceId).toHaveBeenCalledWith('s1');
  });

  it('delegates reorder to service', async () => {
    const res = await controller.reorder([{ id: 'c1', sort: 2 }]);
    expect(res.success).toBe(true);
    expect(mockService.reorder).toHaveBeenCalled();
  });

  it('delegates update to service', async () => {
    const res = await controller.update('c1', { isRequired: false });
    expect(res.success).toBe(true);
    expect(mockService.update).toHaveBeenCalledWith('c1', { isRequired: false });
  });

  it('delegates delete to service', async () => {
    const res = await controller.delete('c1');
    expect(res.success).toBe(true);
    expect(mockService.delete).toHaveBeenCalledWith('c1');
  });

  it('delegates reorderByService to service', async () => {
    mockService.reorder = jest.fn().mockResolvedValue({ success: true });
    const res = await (controller as any).reorderByService('s1', { items: [{ id: 'c1', sort: 1 }] });
    expect(res.success).toBe(true);
    expect(mockService.reorder).toHaveBeenCalledWith([{ id: 'c1', sort: 1 }], 's1');
  });

  it('delegates updateStatus to service', async () => {
    mockService.updateStatus = jest.fn().mockResolvedValue({ success: true });
    const res = await (controller as any).updateStatus('c1', { isActive: true });
    expect(res.success).toBe(true);
    expect(mockService.updateStatus).toHaveBeenCalledWith('c1', true);
  });
});
