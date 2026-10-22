import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { CategoryController } from '../category.controller';
import { CategoryService } from '../../services/category.service';

describe('CategoryController', () => {
  let controller: CategoryController;
  let mockService: any;

  const validId = 'a0000000-0000-0000-0000-000000000001';

  beforeEach(async () => {
    mockService = {
      create: jest.fn().mockResolvedValue({ success: true, message: 'Created' }),
      findAll: jest.fn().mockResolvedValue({ data: [], meta: { total: 0 } }),
      getAll: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({ id: validId, name: 'Titling' }),
      update: jest.fn().mockResolvedValue({ success: true, message: 'Updated' }),
      delete: jest.fn().mockResolvedValue({ success: true, message: 'Deleted' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        { provide: CategoryService, useValue: mockService },
        Reflector,
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
  });

  it('delegates create to service with userId', async () => {
    const res = await controller.create(
      { userId: 'u1' } as any,
      { name: 'Titling', colorHex: '#111111' },
    );
    expect(res.success).toBe(true);
    expect(mockService.create).toHaveBeenCalledWith(
      { name: 'Titling', colorHex: '#111111' },
      'u1',
    );
  });

  it('delegates findAll to service with pagination and search query', async () => {
    const res = await controller.findAll(1, 10, 'search');
    expect(res.data).toBeDefined();
    expect(mockService.findAll).toHaveBeenCalledWith(1, 10, 'search');
  });

  it('delegates getAll to service', async () => {
    const res = await controller.getAll();
    expect(Array.isArray(res)).toBe(true);
    expect(mockService.getAll).toHaveBeenCalled();
  });

  it('delegates findOne to service', async () => {
    const res = await controller.findOne(validId);
    expect(res.id).toBe(validId);
    expect(mockService.findOne).toHaveBeenCalledWith(validId);
  });

  it('delegates update to service', async () => {
    const res = await controller.update(
      { userId: 'u1' } as any,
      validId,
      { name: 'New Titling' },
    );
    expect(res.success).toBe(true);
    expect(mockService.update).toHaveBeenCalledWith(
      validId,
      { name: 'New Titling' },
      'u1',
    );
  });

  it('delegates delete to service', async () => {
    const res = await controller.delete({ userId: 'u1' } as any, validId);
    expect(res.success).toBe(true);
    expect(mockService.delete).toHaveBeenCalledWith(validId, 'u1');
  });
});
