import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { RequirementMappingController } from '../requirement-mapping.controller';
import { RequirementMappingService } from '../../services/requirement-mapping.service';

describe('RequirementMappingController', () => {
  let controller: RequirementMappingController;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      create: jest.fn().mockResolvedValue({ success: true, message: 'Created' }),
      findAll: jest.fn().mockResolvedValue({ success: true, data: [] }),
      findByServiceId: jest.fn().mockResolvedValue({ success: true, data: [] }),
      findBySourceRequirement: jest.fn().mockResolvedValue({ success: true, data: [] }),
      findByTargetRequirement: jest.fn().mockResolvedValue({ success: true, data: [] }),
      findOne: jest.fn().mockResolvedValue({ success: true, data: { id: 'map-1' } }),
      update: jest.fn().mockResolvedValue({ success: true, message: 'Updated' }),
      delete: jest.fn().mockResolvedValue({ success: true, message: 'Deleted' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequirementMappingController],
      providers: [
        { provide: RequirementMappingService, useValue: mockService },
        Reflector,
      ],
    }).compile();

    controller = module.get<RequirementMappingController>(RequirementMappingController);
  });

  it('delegates create to service', async () => {
    const res = await controller.create({
      sourceRequirementId: 'src-1',
      targetRequirementId: 'tgt-1',
      sourceFieldName: 'srcField',
      targetFieldName: 'tgtField',
    });
    expect(res.success).toBe(true);
    expect(mockService.create).toHaveBeenCalled();
  });

  it('delegates findByServiceId to service', async () => {
    const res = await controller.findByServiceId('svc-1');
    expect(res.success).toBe(true);
    expect(mockService.findByServiceId).toHaveBeenCalledWith('svc-1');
  });

  it('delegates update to service', async () => {
    const res = await controller.update('map-1', { priority: 2 });
    expect(res.success).toBe(true);
    expect(mockService.update).toHaveBeenCalledWith('map-1', { priority: 2 });
  });

  it('delegates delete to service', async () => {
    const res = await controller.delete('map-1');
    expect(res.success).toBe(true);
    expect(mockService.delete).toHaveBeenCalledWith('map-1');
  });
});
