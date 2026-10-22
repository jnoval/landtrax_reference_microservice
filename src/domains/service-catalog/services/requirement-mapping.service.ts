import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { isUUID, uuidv4 } from '../../../shared/utils/uuid';
import { CommonResponse, CustomMeta } from '../../../shared/common';
import RequirementEntity from '../../../shared/infrastructure/database/entities/requirement.entity';
import RequirementMappingEntity from '../../../shared/infrastructure/database/entities/requirement-mapping.entity';
import ServiceEntity from '../../../shared/infrastructure/database/entities/service-catalog.entity';
import { CreateRequirementMappingDto, UpdateRequirementMappingDto } from '../dtos/create-requirement-mapping.dto';

@Injectable()
export class RequirementMappingService {
  private readonly _logger = new Logger(RequirementMappingService.name);

  constructor(
    @InjectRepository(RequirementMappingEntity)
    private readonly _mappingRepo: Repository<RequirementMappingEntity>,
    @InjectRepository(RequirementEntity)
    private readonly _requirementRepo: Repository<RequirementEntity>,
    @InjectRepository(ServiceEntity)
    private readonly _serviceRepo: Repository<ServiceEntity>,
  ) {}

  async create(dto: CreateRequirementMappingDto): Promise<CommonResponse<RequirementMappingEntity>> {
    const duplicateWhere: Record<string, unknown> = {
      sourceRequirementId: dto.sourceRequirementId,
      targetRequirementId: dto.targetRequirementId,
      deletedDate: IsNull(),
    };
    if (dto.serviceId) {
      duplicateWhere.serviceId = dto.serviceId;
    }

    const existing = await this._mappingRepo.findOne({ where: duplicateWhere });
    if (existing) {
      throw new ConflictException(
        'The selected OCR Field is already mapped to this document requirement.',
      );
    }

    const mapping = this._mappingRepo.create({
      id: uuidv4(),
      createdDate: new Date(),
      sourceRequirementId: dto.sourceRequirementId,
      targetRequirementId: dto.targetRequirementId,
      serviceId: dto.serviceId || null,
      sourceFieldName: dto.sourceFieldName,
      targetFieldName: dto.targetFieldName,
      priority: dto.priority || 1,
    });

    const saved = await this._mappingRepo.save(mapping);
    return {
      success: true,
      message: 'Requirement mapping created successfully',
      data: saved,
    };
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    serviceId?: string;
  }): Promise<CommonResponse<RequirementMappingEntity[]>> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const qb = this._mappingRepo
      .createQueryBuilder('mapping')
      .leftJoinAndSelect('mapping.sourceRequirement', 'sourceRequirement')
      .leftJoinAndSelect('mapping.service', 'service')
      .where('mapping.deletedDate IS NULL');

    if (query.serviceId) {
      qb.andWhere('mapping.serviceId = :serviceId', { serviceId: query.serviceId });
    }

    qb.orderBy('mapping.priority', 'ASC');

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    const meta: CustomMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };

    return {
      success: true,
      message: 'Requirement mappings retrieved successfully',
      data,
      meta: meta as any,
    };
  }

  async findOne(id: string): Promise<CommonResponse<RequirementMappingEntity>> {
    if (!isUUID(id)) {
      throw new NotFoundException(`Requirement mapping with ID ${id} not found`);
    }

    const mapping = await this._mappingRepo.findOne({
      where: { id, deletedDate: IsNull() },
      relations: ['sourceRequirement', 'service'],
    });

    if (!mapping) {
      throw new NotFoundException(`Requirement mapping with ID ${id} not found`);
    }

    return {
      success: true,
      message: 'Requirement mapping retrieved successfully',
      data: mapping,
    };
  }

  async findByServiceId(serviceId: string): Promise<RequirementMappingEntity[]> {
    const mappings = await this._mappingRepo.find({
      where: { serviceId, deletedDate: IsNull() },
      relations: ['sourceRequirement'],
      order: { priority: 'ASC' },
    });

    const targetRequirementIds = [
      ...new Set(mappings.map((m) => m.targetRequirementId).filter(Boolean)),
    ];
    if (targetRequirementIds.length > 0) {
      const targets = await this._requirementRepo.find({
        where: { id: In(targetRequirementIds) },
        select: ['id', 'name', 'placeholder'],
      });
      const targetMap = new Map(targets.map((t) => [t.id, t]));
      mappings.forEach((mapping) => {
        const target = targetMap.get(mapping.targetRequirementId);
        if (target) {
          (mapping as any).targetRequirement = {
            id: target.id,
            name: target.name,
            placeholder: target.placeholder,
          };
        }
      });
    }

    return mappings;
  }

  async findBySourceRequirement(sourceRequirementId: string): Promise<RequirementMappingEntity[]> {
    return await this._mappingRepo.find({
      where: { sourceRequirementId, deletedDate: IsNull() },
      relations: ['service'],
      order: { priority: 'ASC' },
    });
  }

  async findByTargetRequirement(targetRequirementId: string): Promise<RequirementMappingEntity[]> {
    return await this._mappingRepo.find({
      where: { targetRequirementId, deletedDate: IsNull() },
      relations: ['sourceRequirement', 'service'],
      order: { priority: 'ASC' },
    });
  }

  async update(
    id: string,
    dto: UpdateRequirementMappingDto,
  ): Promise<CommonResponse<RequirementMappingEntity>> {
    if (!isUUID(id)) {
      throw new NotFoundException(`Requirement mapping with ID ${id} not found`);
    }

    const mapping = await this._mappingRepo.findOne({
      where: { id, deletedDate: IsNull() },
    });

    if (!mapping) {
      throw new NotFoundException(`Requirement mapping with ID ${id} not found`);
    }

    Object.assign(mapping, {
      ...dto,
      updatedDate: new Date(),
    });

    const saved = await this._mappingRepo.save(mapping);
    return {
      success: true,
      message: 'Requirement mapping updated successfully',
      data: saved,
    };
  }

  async delete(id: string): Promise<CommonResponse> {
    if (!isUUID(id)) {
      throw new NotFoundException(`Requirement mapping with ID ${id} not found`);
    }

    const mapping = await this._mappingRepo.findOne({
      where: { id, deletedDate: IsNull() },
    });

    if (!mapping) {
      throw new NotFoundException(`Requirement mapping with ID ${id} not found`);
    }

    mapping.deletedDate = new Date();
    await this._mappingRepo.save(mapping);

    return {
      success: true,
      message: 'Requirement mapping deleted successfully',
    };
  }
}
