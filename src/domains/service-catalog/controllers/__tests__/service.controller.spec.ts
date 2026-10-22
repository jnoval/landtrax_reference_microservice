import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ServiceCatalogController } from '../service.controller';
import { ServiceCatalogService } from '../../services/service.service';

describe('ServiceCatalogController', () => {
  let controller: ServiceCatalogController;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      create: jest.fn().mockResolvedValue({ success: true, message: 'Created' }),
      findAll: jest.fn().mockResolvedValue({ success: true, data: [] }),
      findOne: jest.fn().mockResolvedValue({ success: true, data: { id: 'svc-1' } }),
      update: jest.fn().mockResolvedValue({ success: true, message: 'Updated' }),
      updateStatus: jest.fn().mockResolvedValue({ success: true, message: 'Status updated' }),
      bulkUpdateStatus: jest.fn().mockResolvedValue({ success: true, message: 'Bulk status updated' }),
      delete: jest.fn().mockResolvedValue({ success: true, message: 'Deleted' }),
      bulkDelete: jest.fn().mockResolvedValue({ success: true, message: 'Bulk deleted' }),
      getChecklist: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceCatalogController],
      providers: [
        { provide: ServiceCatalogService, useValue: mockService },
        Reflector,
      ],
    }).compile();

    controller = module.get<ServiceCatalogController>(ServiceCatalogController);
  });

  it('delegates create to service', async () => {
    const res = await controller.create({ userId: 'u1' } as any, { name: 'Title Transfer' } as any);
    expect(res.success).toBe(true);
    expect(mockService.create).toHaveBeenCalledWith('u1', { name: 'Title Transfer' });
  });

  it('delegates findAll to service', async () => {
    const res = await controller.findAll({ page: 1 });
    expect(res.success).toBe(true);
    expect(mockService.findAll).toHaveBeenCalledWith({ page: 1 });
  });

  it('delegates getActiveCatalogs to service with isActive: true', async () => {
    const res = await controller.getActiveCatalogs({ page: 1, limit: 1000 });
    expect(res.success).toBe(true);
    expect(mockService.findAll).toHaveBeenCalledWith({ page: 1, limit: 1000, isActive: true });
  });

  it('delegates findOne to service', async () => {
    const res = await controller.findOne('svc-1');
    expect((res as any).data.id).toBe('svc-1');
  });

  it('delegates update to service', async () => {
    const res = await controller.update({ userId: 'u1' } as any, 'svc-1', { name: 'New' });
    expect(res.success).toBe(true);
    expect(mockService.update).toHaveBeenCalledWith('u1', 'svc-1', { name: 'New' });
  });

  it('delegates bulkUpdateStatus to service', async () => {
    const res = await controller.bulkUpdateStatus({ ids: ['svc-1'], isActive: false });
    expect(res.success).toBe(true);
    expect(mockService.bulkUpdateStatus).toHaveBeenCalled();
  });

  it('delegates delete to service', async () => {
    const res = await controller.delete('svc-1');
    expect(res.success).toBe(true);
    expect(mockService.delete).toHaveBeenCalledWith('svc-1');
  });

  it('delegates getChecklist to checklistService or service', async () => {
    const res = await (controller as any).getChecklist('svc-1');
    expect(res).toBeDefined();
  });
});
