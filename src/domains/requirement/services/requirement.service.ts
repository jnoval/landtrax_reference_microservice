import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { CommonResponse, CustomMeta } from '../../../shared/common';
import RequirementEntity from '../../../shared/infrastructure/database/entities/requirement.entity';
import { uuidv4 } from '../../../shared/utils/uuid';
import { validateFileNameFormat } from '../constants/filename-variables';
import {
  BulkDeleteRequirementDto,
  BulkUpdateRequirementStatusDto,
  CreateRequirementDto,
  UpdateRequirementDto,
  UpdateRequirementStatusDto,
} from '../dtos/create-requirement.dto';

@Injectable()
export class RequirementService {
  private readonly _logger = new Logger(RequirementService.name);

  constructor(
    @InjectRepository(RequirementEntity)
    private readonly _requirementRepo: Repository<RequirementEntity>,
  ) {}

  async create(userId: string, data: CreateRequirementDto): Promise<CommonResponse<RequirementEntity>> {
    const trimmedName = data.name.trim();
    const existing = await this._requirementRepo.findOne({
      where: { name: trimmedName, deletedDate: IsNull() },
    });
    if (existing) {
      throw new ConflictException('Requirement Name already exists.');
    }

    if (data.type === 'DOCUMENT' && data.fileNameFormat) {
      validateFileNameFormat(data.fileNameFormat);
    }

    const requirement = this._requirementRepo.create({
      id: uuidv4(),
      createdBy: userId,
      createdDate: new Date(),
      requirementCode: data.requirementCode || `REQ-${Date.now()}`,
      name: trimmedName,
      description: data.description || null,
      type: data.type,
      maxFiles: data.maxFiles || 10,
      minFiles: data.minFiles || 1,
      maxFileSize: data.maxFileSize || 25,
      acceptedFileTypes: data.acceptedFileTypes,
      acceptedGovernmentIds: data.acceptedGovernmentIds,
      fileNameFormat: data.fileNameFormat || null,
      placeholder: data.placeholder,
      isOptional: data.isOptional || false,
      isClassificationEnabled: data.isClassificationEnabled ?? true,
      isActive: true,
    });

    const saved = await this._requirementRepo.save(requirement);
    return {
      success: true,
      message: 'Requirement created successfully',
      data: saved,
    };
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    isActive?: string | boolean;
    sortByField?: string;
    sortDirection?: 'ASC' | 'DESC';
  }): Promise<CommonResponse<RequirementEntity[]>> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const qb = this._requirementRepo
      .createQueryBuilder('requirement')
      .where('requirement.deletedDate IS NULL');

    if (query.search) {
      qb.andWhere(
        '(requirement.name LIKE :search OR requirement.requirementCode LIKE :search OR requirement.description LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.type) {
      qb.andWhere('requirement.type = :type', { type: query.type });
    }

    if (query.isActive !== undefined && query.isActive !== '') {
      const activeBool = query.isActive === 'true' || query.isActive === true;
      qb.andWhere('requirement.isActive = :isActive', { isActive: activeBool ? 1 : 0 });
    }

    const sortField = query.sortByField || 'requirement.createdDate';
    const sortDir = query.sortDirection?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    qb.orderBy(sortField.includes('.') ? sortField : `requirement.${sortField}`, sortDir);

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    const meta: CustomMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };

    return {
      success: true,
      message: 'Requirements retrieved successfully',
      data,
      meta: meta as any,
    };
  }

  async findOne(id: string): Promise<CommonResponse<RequirementEntity>> {
    const requirement = await this._requirementRepo.findOne({
      where: { id, deletedDate: IsNull() },
    });

    if (!requirement) {
      throw new NotFoundException(`Requirement with ID ${id} not found`);
    }

    return {
      success: true,
      message: 'Requirement retrieved successfully',
      data: requirement,
    };
  }

  async findByCode(requirementCode: string): Promise<CommonResponse<RequirementEntity>> {
    const requirement = await this._requirementRepo.findOne({
      where: { requirementCode, deletedDate: IsNull() },
    });

    if (!requirement) {
      throw new NotFoundException(`Requirement with code ${requirementCode} not found`);
    }

    return {
      success: true,
      message: 'Requirement retrieved successfully',
      data: requirement,
    };
  }

  async update(
    userId: string,
    id: string,
    data: UpdateRequirementDto,
  ): Promise<CommonResponse<RequirementEntity>> {
    const requirement = await this._requirementRepo.findOne({
      where: { id, deletedDate: IsNull() },
    });

    if (!requirement) {
      throw new NotFoundException(`Requirement with ID ${id} not found`);
    }

    if (data.name && data.name.trim() !== requirement.name) {
      const existing = await this._requirementRepo.findOne({
        where: { name: data.name.trim(), id: Not(id), deletedDate: IsNull() },
      });
      if (existing) {
        throw new ConflictException('Requirement Name already exists.');
      }
    }

    if (data.fileNameFormat) {
      validateFileNameFormat(data.fileNameFormat);
    }

    Object.assign(requirement, {
      ...data,
      name: data.name ? data.name.trim() : requirement.name,
      updatedBy: userId,
      updatedDate: new Date(),
    });

    const saved = await this._requirementRepo.save(requirement);
    return {
      success: true,
      message: 'Requirement updated successfully',
      data: saved,
    };
  }

  async updateStatus(
    id: string,
    dto: UpdateRequirementStatusDto,
  ): Promise<CommonResponse<RequirementEntity>> {
    const requirement = await this._requirementRepo.findOne({
      where: { id, deletedDate: IsNull() },
    });

    if (!requirement) {
      throw new NotFoundException(`Requirement with ID ${id} not found`);
    }

    requirement.isActive = dto.isActive;
    requirement.updatedDate = new Date();

    const saved = await this._requirementRepo.save(requirement);
    return {
      success: true,
      message: 'Requirement status updated successfully',
      data: saved,
    };
  }

  async bulkUpdateStatus(dto: BulkUpdateRequirementStatusDto): Promise<CommonResponse> {
    if (!dto.ids || dto.ids.length === 0) {
      throw new BadRequestException('IDs array is required');
    }

    await this._requirementRepo
      .createQueryBuilder()
      .update(RequirementEntity)
      .set({ isActive: dto.isActive, updatedDate: new Date() })
      .whereInIds(dto.ids)
      .andWhere('deletedDate IS NULL')
      .execute();

    return {
      success: true,
      message: 'Requirement statuses updated successfully',
    };
  }

  async delete(id: string): Promise<CommonResponse> {
    const requirement = await this._requirementRepo.findOne({
      where: { id, deletedDate: IsNull() },
    });

    if (!requirement) {
      throw new NotFoundException(`Requirement with ID ${id} not found`);
    }

    requirement.deletedDate = new Date();
    await this._requirementRepo.save(requirement);

    return {
      success: true,
      message: 'Requirement deleted successfully',
    };
  }

  async bulkDelete(dto: BulkDeleteRequirementDto): Promise<CommonResponse> {
    if (!dto.ids || dto.ids.length === 0) {
      throw new BadRequestException('IDs array is required');
    }

    await this._requirementRepo
      .createQueryBuilder()
      .update(RequirementEntity)
      .set({ deletedDate: new Date() })
      .whereInIds(dto.ids)
      .andWhere('deletedDate IS NULL')
      .execute();

    return {
      success: true,
      message: 'Requirements deleted successfully',
    };
  }
}
