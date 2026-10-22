import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {  IsNull, Not, Repository } from 'typeorm';
import { isUUID, uuidv4 } from '../../../shared/utils/uuid';
import { CommonResponse, CustomMeta } from '../../../shared/common';
import ServiceEntity from '../../../shared/infrastructure/database/entities/service-catalog.entity';
import { CategoryEntity } from '../../../shared/infrastructure/database/entities/category.entity';
import { BulkDeleteServiceDto } from '../dtos/bulk-delete-service.dto';
import { BulkUpdateServiceStatusDto } from '../dtos/bulk-update-service-status.dto';
import { CreateServiceDto } from '../dtos/create-service.dto';
import { UpdateServiceDto } from '../dtos/update-service.dto';
import { UpdateServiceStatusDto } from '../dtos/update-service-status.dto';

@Injectable()
export class ServiceCatalogService {
  private readonly _logger = new Logger(ServiceCatalogService.name);

  constructor(
    @InjectRepository(ServiceEntity)
    private readonly _serviceRepo: Repository<ServiceEntity>,
    @InjectRepository(CategoryEntity)
    private readonly _categoryRepo: Repository<CategoryEntity>,
  ) {}

  async create(userId: string, createServiceDto: CreateServiceDto): Promise<CommonResponse<ServiceEntity>> {
    const checkNameExist = await this._serviceRepo.findOne({
      where: { name: createServiceDto.name, deletedDate: IsNull() },
    });
    if (checkNameExist) {
      throw new HttpException(
        `Service catalog with name ${createServiceDto.name} already exists`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const service = this._serviceRepo.create({
      id: uuidv4(),
      createdBy: userId,
      createdDate: new Date(),
      updatedBy: null,
      updatedDate: null,
      deletedBy: null,
      deletedDate: null,
      ...createServiceDto,
      isActive: true,
    });

    const saved = await this._serviceRepo.save(service);
    return {
      success: true,
      message: 'Service catalog created successfully',
      data: saved,
    };
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    isActive?: string | boolean;
    sortByField?: string;
    sortDirection?: 'ASC' | 'DESC';
  }): Promise<CommonResponse<ServiceEntity[]>> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(1000, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const qb = this._serviceRepo
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.category', 'category')
      .leftJoinAndSelect('service.serviceChecklists', 'serviceChecklists')
      .leftJoinAndSelect('serviceChecklists.requirement', 'requirement')
      .where('service.deletedDate IS NULL');

    if (query.search) {
      qb.andWhere(
        '(service.name LIKE :search OR service.serviceCode LIKE :search OR service.description LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.category) {
      qb.andWhere('(service.type = :category OR service.categoryId = :category)', {
        category: query.category,
      });
    }

    if (query.isActive !== undefined && query.isActive !== '') {
      const activeBool = query.isActive === 'true' || query.isActive === true;
      qb.andWhere('service.isActive = :isActive', { isActive: activeBool ? 1 : 0 });
    }

    const sortField = query.sortByField || 'service.createdDate';
    const sortDir = query.sortDirection?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    qb.orderBy(sortField.includes('.') ? sortField : `service.${sortField}`, sortDir);

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    const meta: CustomMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };

    return {
      success: true,
      message: 'Service catalogs retrieved successfully',
      data,
      meta: meta as any,
    };
  }

  async findOne(id: string): Promise<CommonResponse<ServiceEntity>> {
    if (!isUUID(id)) {
      throw new NotFoundException(`Service catalog with ID ${id} not found`);
    }

    const service = await this._serviceRepo.findOne({
      where: { id, deletedDate: IsNull() },
      relations: [
        'category',
        'serviceChecklists',
        'serviceChecklists.requirement',
        'requirementMappings',
      ],
    });

    if (!service) {
      throw new NotFoundException(`Service catalog with ID ${id} not found`);
    }

    return {
      success: true,
      message: 'Service catalog retrieved successfully',
      data: service,
    };
  }

  async getChecklist(id: string) {
    const serviceRes = await this.findOne(id);
    return serviceRes.data?.serviceChecklists || [];
  }

  async update(
    userId: string,
    id: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<CommonResponse<ServiceEntity>> {
    if (!isUUID(id)) {
      throw new NotFoundException(`Service catalog with ID ${id} not found`);
    }

    const service = await this._serviceRepo.findOne({
      where: { id, deletedDate: IsNull() },
    });
    if (!service) {
      throw new NotFoundException(`Service catalog with ID ${id} not found`);
    }

    if (updateServiceDto.name && updateServiceDto.name !== service.name) {
      const checkName = await this._serviceRepo.findOne({
        where: { name: updateServiceDto.name, id: Not(id), deletedDate: IsNull() },
      });
      if (checkName) {
        throw new BadRequestException(
          `Service catalog with name ${updateServiceDto.name} already exists`,
        );
      }
    }

    Object.assign(service, {
      ...updateServiceDto,
      updatedBy: userId,
      updatedDate: new Date(),
    });

    const saved = await this._serviceRepo.save(service);
    return {
      success: true,
      message: 'Service catalog updated successfully',
      data: saved,
    };
  }

  async updateStatus(
    id: string,
    dto: UpdateServiceStatusDto,
  ): Promise<CommonResponse<ServiceEntity>> {
    if (!isUUID(id)) {
      throw new NotFoundException(`Service catalog with ID ${id} not found`);
    }

    const service = await this._serviceRepo.findOne({
      where: { id, deletedDate: IsNull() },
    });
    if (!service) {
      throw new NotFoundException(`Service catalog with ID ${id} not found`);
    }

    service.isActive = dto.isActive;
    service.updatedDate = new Date();

    const saved = await this._serviceRepo.save(service);
    return {
      success: true,
      message: 'Service catalog status updated successfully',
      data: saved,
    };
  }

  async bulkUpdateStatus(dto: BulkUpdateServiceStatusDto): Promise<CommonResponse> {
    if (!dto.ids || dto.ids.length === 0) {
      throw new BadRequestException('IDs array is required');
    }

    await this._serviceRepo
      .createQueryBuilder()
      .update(ServiceEntity)
      .set({ isActive: dto.isActive, updatedDate: new Date() })
      .whereInIds(dto.ids)
      .andWhere('deletedDate IS NULL')
      .execute();

    return {
      success: true,
      message: 'Service catalog statuses updated successfully',
    };
  }

  async delete(id: string): Promise<CommonResponse> {
    if (!isUUID(id)) {
      throw new NotFoundException(`Service catalog with ID ${id} not found`);
    }

    const service = await this._serviceRepo.findOne({
      where: { id, deletedDate: IsNull() },
    });
    if (!service) {
      throw new NotFoundException(`Service catalog with ID ${id} not found`);
    }

    service.deletedDate = new Date();
    await this._serviceRepo.save(service);

    return {
      success: true,
      message: 'Service catalog deleted successfully',
    };
  }

  async bulkDelete(dto: BulkDeleteServiceDto): Promise<CommonResponse> {
    if (!dto.ids || dto.ids.length === 0) {
      throw new BadRequestException('IDs array is required');
    }

    await this._serviceRepo
      .createQueryBuilder()
      .update(ServiceEntity)
      .set({ deletedDate: new Date() })
      .whereInIds(dto.ids)
      .andWhere('deletedDate IS NULL')
      .execute();

    return {
      success: true,
      message: 'Service catalogs deleted successfully',
    };
  }
}
