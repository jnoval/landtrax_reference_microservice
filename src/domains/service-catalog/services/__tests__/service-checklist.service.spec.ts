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

  it('finds items by service ID and returns array directly', async () => {
    mockChecklistRepo.find.mockResolvedValue([{ id: 'chk-1', serviceId: 'svc-1' }]);

    const res: any = await service.findByServiceId('svc-1');
    expect(Array.isArray(res)).toBe(true);
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('chk-1');
  });

  it('updates status of checklist item', async () => {
    const validId = 'a0000000-0000-0000-0000-000000000001';
    mockChecklistRepo.findOne.mockResolvedValue({ id: validId, isActive: false });

    const res = await (service as any).updateStatus(validId, true);
    expect(res.success).toBe(true);
    expect(mockChecklistRepo.save).toHaveBeenCalled();
  });

  it('throws NotFoundException on findOne when id is invalid UUID', async () => {
    await expect(service.findOne('active')).rejects.toThrow(NotFoundException);
    expect(mockChecklistRepo.findOne).not.toHaveBeenCalled();
  });

  it('deletes checklist item', async () => {
    const validId = 'a0000000-0000-0000-0000-000000000001';
    mockChecklistRepo.findOne.mockResolvedValue({ id: validId, deletedDate: null });

    const res = await service.delete(validId);
    expect(res.success).toBe(true);
    expect(mockChecklistRepo.save).toHaveBeenCalled();
  });

  it('checks checklist readiness when confirmed is false in deleteByServiceId', async () => {
    const validId = 'a0000000-0000-0000-0000-000000000001';
    const res = await service.deleteByServiceId(validId, false);
    expect(res.success).toBe(true);
  });

  it('executes deletion when confirmed is true in deleteByServiceId', async () => {
    const validId = 'a0000000-0000-0000-0000-000000000001';
    const mockQb = {
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ affected: 3 }),
    };
    mockChecklistRepo.createQueryBuilder.mockReturnValue(mockQb);

    const res = await service.deleteByServiceId(validId, true);
    expect(res.success).toBe(true);
    expect(mockQb.execute).toHaveBeenCalled();
  });
});
