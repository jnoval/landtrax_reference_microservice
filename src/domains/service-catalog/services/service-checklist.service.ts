import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { uuidv4 } from '../../../shared/utils/uuid';
import { CommonResponse, CustomMeta } from '../../../shared/common';
import RequirementEntity from '../../../shared/infrastructure/database/entities/requirement.entity';
import ServiceEntity from '../../../shared/infrastructure/database/entities/service-catalog.entity';
import ServiceChecklistEntity from '../../../shared/infrastructure/database/entities/service-checklist.entity';
import { CreateServiceChecklistDto, ReorderItemDto, UpdateServiceChecklistDto } from '../dtos/create-service-checklist.dto';

@Injectable()
export class ServiceChecklistService {
  private readonly _logger = new Logger(ServiceChecklistService.name);

  constructor(
    @InjectRepository(ServiceChecklistEntity)
    private readonly _checklistRepo: Repository<ServiceChecklistEntity>,
    @InjectRepository(RequirementEntity)
    private readonly _requirementRepo: Repository<RequirementEntity>,
    @InjectRepository(ServiceEntity)
    private readonly _serviceRepo: Repository<ServiceEntity>,
  ) {}

  async create(dto: CreateServiceChecklistDto): Promise<CommonResponse<ServiceChecklistEntity>> {
    const existing = await this._checklistRepo.findOne({
      where: {
        serviceId: dto.serviceId,
        requirementId: dto.requirementId,
        deletedDate: IsNull(),
      },
    });

    if (existing) {
      throw new HttpException(
        'The selected requirement already exists in this checklist',
        HttpStatus.BAD_REQUEST,
      );
    }

    const checklist = this._checklistRepo.create({
      id: uuidv4(),
      createdDate: new Date(),
      serviceId: dto.serviceId,
      requirementId: dto.requirementId,
      isRequired: dto.isRequired,
      sort: dto.sort || 0,
      isActive: true,
    });

    const saved = await this._checklistRepo.save(checklist);
    return {
      success: true,
      message: 'Service checklist item created successfully',
      data: saved,
    };
  }

  async findAll(query: { page?: number; limit?: number; serviceId?: string }): Promise<CommonResponse<ServiceChecklistEntity[]>> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const qb = this._checklistRepo
      .createQueryBuilder('checklist')
      .leftJoinAndSelect('checklist.requirement', 'requirement')
      .leftJoinAndSelect('checklist.service', 'service')
      .where('checklist.deletedDate IS NULL');

    if (query.serviceId) {
      qb.andWhere('checklist.serviceId = :serviceId', { serviceId: query.serviceId });
    }

    qb.orderBy('checklist.sort', 'ASC');

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    const meta: CustomMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };

    return {
      success: true,
      message: 'Service checklist items retrieved successfully',
      data,
      meta: meta as any,
    };
  }

  async findOne(id: string): Promise<CommonResponse<ServiceChecklistEntity>> {
    const item = await this._checklistRepo.findOne({
      where: { id, deletedDate: IsNull() },
      relations: ['requirement', 'service'],
    });

    if (!item) {
      throw new NotFoundException(`Checklist item with ID ${id} not found`);
    }

    return {
      success: true,
      message: 'Service checklist item retrieved successfully',
      data: item,
    };
  }

  async findByServiceId(serviceId: string): Promise<CommonResponse<ServiceChecklistEntity[]>> {
    const items = await this._checklistRepo.find({
      where: { serviceId, deletedDate: IsNull() },
      relations: ['requirement'],
      order: { sort: 'ASC' },
    });

    return {
      success: true,
      message: 'Checklist items for service retrieved successfully',
      data: items,
    };
  }

  async update(id: string, dto: UpdateServiceChecklistDto): Promise<CommonResponse<ServiceChecklistEntity>> {
    const item = await this._checklistRepo.findOne({
      where: { id, deletedDate: IsNull() },
    });

    if (!item) {
      throw new NotFoundException(`Checklist item with ID ${id} not found`);
    }

    Object.assign(item, {
      ...dto,
      updatedDate: new Date(),
    });

    const saved = await this._checklistRepo.save(item);
    return {
      success: true,
      message: 'Checklist item updated successfully',
      data: saved,
    };
  }

  async reorder(items: ReorderItemDto[]): Promise<CommonResponse> {
    for (const item of items) {
      await this._checklistRepo.update(item.id, { sort: item.sort, updatedDate: new Date() });
    }

    return {
      success: true,
      message: 'Checklist items reordered successfully',
    };
  }

  async delete(id: string): Promise<CommonResponse> {
    const item = await this._checklistRepo.findOne({
      where: { id, deletedDate: IsNull() },
    });

    if (!item) {
      throw new NotFoundException(`Checklist item with ID ${id} not found`);
    }

    item.deletedDate = new Date();
    await this._checklistRepo.save(item);

    return {
      success: true,
      message: 'Checklist item deleted successfully',
    };
  }
}
