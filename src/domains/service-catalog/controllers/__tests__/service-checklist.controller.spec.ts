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
    const res = await controller.findByServiceId('s1');
    expect(res.success).toBe(true);
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
});
