import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { SystemSettingsController } from '../system-settings.controller';
import { SystemSettingsService } from '../../services/system-settings.service';

describe('SystemSettingsController', () => {
  let controller: SystemSettingsController;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      create: jest.fn().mockResolvedValue({ success: true, message: 'Created' }),
      findAll: jest.fn().mockResolvedValue({ success: true, data: [] }),
      getByKey: jest.fn().mockResolvedValue({ id: 's1', key: 'app.name', value: 'LT' }),
      findById: jest.fn().mockResolvedValue({ id: 's1', key: 'app.name' }),
      bulkUpdate: jest.fn().mockResolvedValue({ success: true, message: 'Bulk updated' }),
      update: jest.fn().mockResolvedValue({ success: true, message: 'Updated' }),
      delete: jest.fn().mockResolvedValue({ success: true, message: 'Deleted' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemSettingsController],
      providers: [
        { provide: SystemSettingsService, useValue: mockService },
        Reflector,
      ],
    }).compile();

    controller = module.get<SystemSettingsController>(SystemSettingsController);
  });

  it('delegates create to service', async () => {
    const res = await controller.create({ userId: 'u1' } as any, { key: 'k1', name: 'N1', value: 'V1' });
    expect(res.success).toBe(true);
    expect(mockService.create).toHaveBeenCalled();
  });

  it('delegates getByKey to service', async () => {
    const res = await controller.getByKey('app.name');
    expect(res.key).toBe('app.name');
    expect(mockService.getByKey).toHaveBeenCalledWith('app.name');
  });

  it('delegates update to service', async () => {
    const res = await controller.update({ userId: 'u1' } as any, 's1', { value: 'V2' });
    expect(res.success).toBe(true);
    expect(mockService.update).toHaveBeenCalledWith('u1', 's1', { value: 'V2' });
  });

  it('delegates delete to service', async () => {
    const res = await controller.delete({ userId: 'u1' } as any, 's1');
    expect(res.success).toBe(true);
    expect(mockService.delete).toHaveBeenCalledWith('s1', 'u1');
  });
});
