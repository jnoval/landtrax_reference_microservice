import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { CommonResponse, CustomMeta } from '../../../shared/common';
import { LocationEntity } from '../../../shared/infrastructure/database/entities/location.entity';
import { RedisCacheService } from '../../../shared/infrastructure/redis/redis-cache.service';
import { uuidv4 } from '../../../shared/utils/uuid';
import { CreateLocationDto, UpdateLocationDto } from '../dtos/location.dto';

@Injectable()
export class LocationService {
  private readonly _logger = new Logger(LocationService.name);
  private static readonly ACTIVE_CACHE_KEY = 'location:active';

  constructor(
    @InjectRepository(LocationEntity)
    private readonly _locationRepo: Repository<LocationEntity>,
    private readonly _redisService: RedisCacheService,
  ) {}

  async create(data: CreateLocationDto, createdBy: string): Promise<CommonResponse<LocationEntity>> {
    const isDuplicate = await this._locationRepo.findOne({
      where: { name: data.name, deletedDate: IsNull() },
    });

    if (isDuplicate) {
      throw new ConflictException(`Location with name of ${data.name} already exists.`);
    }

    const entity = this._locationRepo.create({
      id: uuidv4(),
      createdBy,
      createdDate: new Date(),
      name: data.name,
      abbreviation: data.abbreviation || null,
      address: data.address || null,
      isActive: data.isActive,
    });

    const response = await this._locationRepo.save(entity);
    await this._redisService.del(LocationService.ACTIVE_CACHE_KEY);

    return {
      message: 'Location created successfully',
      success: true,
      data: response,
    };
  }

  async findAllActive(): Promise<LocationEntity[]> {
    const cached = await this._redisService.get<LocationEntity[]>(LocationService.ACTIVE_CACHE_KEY);
    if (cached) {
      return cached;
    }

    const data = await this._locationRepo.find({
      where: {
        isActive: true,
        deletedDate: IsNull(),
      },
      order: { name: 'ASC' },
    });

    await this._redisService.set(LocationService.ACTIVE_CACHE_KEY, data, 600);
    return data;
  }

  async findAllGet(): Promise<LocationEntity[]> {
    return await this._locationRepo
      .createQueryBuilder('location')
      .where('location.deletedDate IS NULL')
      .orderBy('location.name', 'ASC')
      .getMany();
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ data: LocationEntity[]; meta: CustomMeta }> {
    const skip = (page - 1) * limit;

    const qb = this._locationRepo
      .createQueryBuilder('location')
      .where('location.deletedDate IS NULL');

    if (search) {
      qb.andWhere('(location.name LIKE :search OR location.abbreviation LIKE :search)', {
        search: `%${search}%`,
      });
    }

    qb.orderBy('location.name', 'ASC');

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string): Promise<LocationEntity> {
    const entity = await this._locationRepo.findOne({
      where: { id, deletedDate: IsNull() },
    });

    if (!entity) {
      throw new NotFoundException('Location not found');
    }

    return entity;
  }

  async findByCompanyUser(userId: string): Promise<LocationEntity[]> {
    try {
      const rows = await this._locationRepo.manager.query(
        `SELECT DISTINCT rod.Id, rod.Name, rod.Abbreviation, rod.Address, rod.IsActive
         FROM [Location] rod
         WHERE rod.Id IN (
           SELECT u.RegistryOfDeedId
           FROM [User] u
           JOIN UserCompany uc ON uc.UserId = u.Id
           WHERE uc.CompanyId = (
             SELECT TOP 1 CompanyId FROM UserCompany WHERE UserId = @0 AND DeletedDate IS NULL
           )
           AND uc.DeletedDate IS NULL
           AND u.DeletedDate IS NULL
         )
         AND rod.IsActive = 1
         AND rod.DeletedDate IS NULL
         ORDER BY rod.Name ASC`,
        [userId],
      );
      return rows || [];
    } catch (e: any) {
      this._logger.warn(`Failed to query company locations for user ${userId}: ${e.message}`);
      return await this.findAllActive();
    }
  }

  async update(
    id: string,
    data: UpdateLocationDto,
    updatedBy: string,
  ): Promise<CommonResponse<LocationEntity>> {
    const entity = await this.findOne(id);

    if (data.name && data.name !== entity.name) {
      const isDuplicate = await this._locationRepo.findOne({
        where: { name: data.name, id: Not(id), deletedDate: IsNull() },
      });
      if (isDuplicate) {
        throw new ConflictException(`Location with name of ${data.name} already exists.`);
      }
    }

    Object.assign(entity, {
      ...data,
      updatedBy,
      updatedDate: new Date(),
    });

    const saved = await this._locationRepo.save(entity);
    await this._redisService.del(LocationService.ACTIVE_CACHE_KEY);

    return {
      message: 'Location updated successfully',
      success: true,
      data: saved,
    };
  }

  async updateStatus(id: string, updatedBy: string): Promise<CommonResponse<LocationEntity>> {
    const entity = await this.findOne(id);
    entity.isActive = !entity.isActive;
    entity.updatedBy = updatedBy;
    entity.updatedDate = new Date();

    const saved = await this._locationRepo.save(entity);
    await this._redisService.del(LocationService.ACTIVE_CACHE_KEY);

    return {
      message: 'Location status updated successfully',
      success: true,
      data: saved,
    };
  }

  async remove(id: string, deletedBy: string): Promise<CommonResponse> {
    const entity = await this.findOne(id);

    entity.deletedBy = deletedBy;
    entity.deletedDate = new Date();
    await this._locationRepo.save(entity);
    await this._redisService.del(LocationService.ACTIVE_CACHE_KEY);

    return {
      message: 'Location removed successfully',
      success: true,
    };
  }
}
