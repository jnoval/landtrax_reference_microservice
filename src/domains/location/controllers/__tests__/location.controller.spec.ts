import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { LocationController } from '../location.controller';
import { LocationService } from '../../services/location.service';

describe('LocationController', () => {
  let controller: LocationController;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      findAllActive: jest.fn().mockResolvedValue([{ id: 'loc-1', name: 'QC RD' }]),
      findByCompanyUser: jest.fn().mockResolvedValue([{ id: 'loc-1', name: 'QC RD' }]),
      create: jest.fn().mockResolvedValue({ success: true, message: 'Created' }),
      findAll: jest.fn().mockResolvedValue({ data: [], meta: {} }),
      findAllGet: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({ id: 'loc-1', name: 'QC RD' }),
      update: jest.fn().mockResolvedValue({ success: true, message: 'Updated' }),
      updateStatus: jest.fn().mockResolvedValue({ success: true, message: 'Status updated' }),
      delete: jest.fn().mockResolvedValue({ success: true, message: 'Removed' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationController],
      providers: [
        { provide: LocationService, useValue: mockService },
        Reflector,
      ],
    }).compile();

    controller = module.get<LocationController>(LocationController);
  });

  it('delegates findAllActive to service', async () => {
    const res = await controller.findAllActive();
    expect(res).toHaveLength(1);
    expect(mockService.findAllActive).toHaveBeenCalled();
  });

  it('delegates findByCompanyUser to service', async () => {
    const res = await controller.findByCompanyUser('u1');
    expect(res).toHaveLength(1);
    expect(mockService.findByCompanyUser).toHaveBeenCalledWith('u1');
  });

  it('delegates create to service', async () => {
    const res = await controller.create({ userId: 'u1' } as any, { name: 'Manila RD', isActive: true });
    expect(res.success).toBe(true);
    expect(mockService.create).toHaveBeenCalled();
  });

  it('delegates updateStatus to service', async () => {
    const res = await controller.updateStatus({ userId: 'u1' } as any, 'loc-1');
    expect(res.success).toBe(true);
    expect(mockService.updateStatus).toHaveBeenCalledWith('loc-1', 'u1');
  });

  it('delegates delete to service', async () => {
    const res = await controller.delete({ userId: 'u1' } as any, 'loc-1');
    expect(res.success).toBe(true);
    expect(mockService.delete).toHaveBeenCalledWith('loc-1', 'u1');
  });
});
