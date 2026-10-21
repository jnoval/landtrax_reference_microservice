import { BadRequestException, HttpException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import RequirementEntity from 'src/shared/infrastructure/database/entities/requirement.entity';
import ServiceEntity from 'src/shared/infrastructure/database/entities/service-catalog.entity';
import ServiceChecklistEntity from 'src/shared/infrastructure/database/entities/service-checklist.entity';
import { ServiceChecklistService } from '../service-checklist.service';

describe('ServiceChecklistService', () => {
  let service: ServiceChecklistService;
  let mockChecklistRepo: any;
  let mockReqRepo: any;
  let mockServiceRepo: any;

  beforeEach(async () => {
    mockChecklistRepo = {
      create: jest.fn((dto) => ({ id: 'chk-1', ...dto })),
      save: jest.fn((e) => Promise.resolve({ id: 'chk-1', ...e })),
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      createQueryBuilder: jest.fn(),
    };
    mockReqRepo = { findOne: jest.fn() };
    mockServiceRepo = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceChecklistService,
        { provide: getRepositoryToken(ServiceChecklistEntity), useValue: mockChecklistRepo },
        { provide: getRepositoryToken(RequirementEntity), useValue: mockReqRepo },
        { provide: getRepositoryToken(ServiceEntity), useValue: mockServiceRepo },
      ],
    }).compile();

    service = module.get<ServiceChecklistService>(ServiceChecklistService);
  });

  it('creates checklist item when unique', async () => {
    mockChecklistRepo.findOne.mockResolvedValue(null);

    const res = await service.create({
      serviceId: 'svc-1',
      requirementId: 'req-1',
      isRequired: true,
      sort: 1,
    });

    expect(res.success).toBe(true);
    expect(res.data?.serviceId).toBe('svc-1');
  });

  it('rejects duplicate checklist item', async () => {
    mockChecklistRepo.findOne.mockResolvedValue({ id: 'existing' });

    await expect(
      service.create({
        serviceId: 'svc-1',
        requirementId: 'req-1',
        isRequired: true,
        sort: 1,
      }),
    ).rejects.toThrow(HttpException);
  });

  it('reorders items successfully', async () => {
    const res = await service.reorder([
      { id: 'item-1', sort: 2 },
      { id: 'item-2', sort: 1 },
    ]);

    expect(res.success).toBe(true);
    expect(mockChecklistRepo.update).toHaveBeenCalledTimes(2);
  });

  it('deletes checklist item', async () => {
    mockChecklistRepo.findOne.mockResolvedValue({ id: 'item-1', deletedDate: null });

    const res = await service.delete('item-1');
    expect(res.success).toBe(true);
    expect(mockChecklistRepo.save).toHaveBeenCalled();
  });
});
