import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import RequirementMappingEntity from 'src/shared/infrastructure/database/entities/requirement-mapping.entity';
import RequirementEntity from 'src/shared/infrastructure/database/entities/requirement.entity';
import ServiceEntity from 'src/shared/infrastructure/database/entities/service-catalog.entity';
import { RequirementMappingService } from '../requirement-mapping.service';

describe('RequirementMappingService', () => {
  let service: RequirementMappingService;
  let mockMappingRepo: any;
  let mockReqRepo: any;
  let mockServiceRepo: any;

  beforeEach(async () => {
    mockMappingRepo = {
      create: jest.fn((dto) => ({ id: 'map-1', ...dto })),
      save: jest.fn((e) => Promise.resolve({ id: 'map-1', ...e })),
      findOne: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    mockReqRepo = { findOne: jest.fn() };
    mockServiceRepo = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequirementMappingService,
        { provide: getRepositoryToken(RequirementMappingEntity), useValue: mockMappingRepo },
        { provide: getRepositoryToken(RequirementEntity), useValue: mockReqRepo },
        { provide: getRepositoryToken(ServiceEntity), useValue: mockServiceRepo },
      ],
    }).compile();

    service = module.get<RequirementMappingService>(RequirementMappingService);
  });

  it('creates requirement mapping when not duplicated', async () => {
    mockMappingRepo.findOne.mockResolvedValue(null);

    const res = await service.create({
      sourceRequirementId: 'req-src',
      targetRequirementId: 'req-tgt',
      sourceFieldName: 'srcField',
      targetFieldName: 'tgtField',
      priority: 1,
    });

    expect(res.success).toBe(true);
    expect(res.data?.sourceFieldName).toBe('srcField');
  });

  it('rejects duplicate requirement mapping', async () => {
    mockMappingRepo.findOne.mockResolvedValue({ id: 'existing' });

    await expect(
      service.create({
        sourceRequirementId: 'req-src',
        targetRequirementId: 'req-tgt',
        sourceFieldName: 'srcField',
        targetFieldName: 'tgtField',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('finds by service ID, returns array directly, and attaches targetRequirement', async () => {
    mockMappingRepo.find.mockResolvedValue([
      { id: 'map-1', serviceId: 'svc-1', targetRequirementId: 'tgt-req-1' },
    ]);
    mockReqRepo.find = jest.fn().mockResolvedValue([
      { id: 'tgt-req-1', name: 'Valid ID Target', placeholder: 'Enter valid ID' },
    ]);

    const res: any = await service.findByServiceId('svc-1');
    expect(Array.isArray(res)).toBe(true);
    expect(res).toHaveLength(1);
    expect(res[0].targetRequirement).toEqual({
      id: 'tgt-req-1',
      name: 'Valid ID Target',
      placeholder: 'Enter valid ID',
    });
  });

  it('throws NotFoundException on findOne when id is invalid UUID', async () => {
    await expect(service.findOne('active')).rejects.toThrow(NotFoundException);
    expect(mockMappingRepo.findOne).not.toHaveBeenCalled();
  });

  it('deletes requirement mapping', async () => {
    const validId = 'a0000000-0000-0000-0000-000000000001';
    mockMappingRepo.findOne.mockResolvedValue({ id: validId, deletedDate: null });

    const res = await service.delete(validId);
    expect(res.success).toBe(true);
    expect(mockMappingRepo.save).toHaveBeenCalled();
  });
});
