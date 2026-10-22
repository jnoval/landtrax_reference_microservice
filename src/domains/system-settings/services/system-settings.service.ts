import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CommonResponse, CustomMeta } from '../../../shared/common';
import SystemSettingEntity from '../../../shared/infrastructure/database/entities/system-setting.entity';
import { RedisCacheService } from '../../../shared/infrastructure/redis/redis-cache.service';
import { uuidv4 } from '../../../shared/utils/uuid';
import {
  CreateSystemSettingDto,
  UpdateSystemSettingBulkItemDto,
  UpdateSystemSettingDto,
} from '../dtos/system-settings.dto';

@Injectable()
export class SystemSettingsService {
  private readonly _logger = new Logger(SystemSettingsService.name);
  private static readonly CACHE_PREFIX = 'system_setting:';
  private static readonly CACHE_TTL_SECONDS = 600; // 10 minutes

  constructor(
    @InjectRepository(SystemSettingEntity)
    private readonly _settingRepo: Repository<SystemSettingEntity>,
    private readonly _redisService: RedisCacheService,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 20,
    filter?: { key?: string; category?: string; name?: string; description?: string },
  ): Promise<CommonResponse<SystemSettingEntity[]>> {
    const skip = (page - 1) * limit;
    const qb = this._settingRepo
      .createQueryBuilder('setting')
      .where('setting.deletedDate IS NULL');

    if (filter) {
      if (filter.key) {
        qb.andWhere('setting.key LIKE :key', { key: `%${filter.key}%` });
      }
      if (filter.category) {
        qb.andWhere('setting.category LIKE :category', { category: `%${filter.category}%` });
      }
      if (filter.name) {
        qb.andWhere('setting.name LIKE :name', { name: `%${filter.name}%` });
      }
      if (filter.description) {
        qb.andWhere('setting.description LIKE :description', {
          description: `%${filter.description}%`,
        });
      }
    }

    qb.orderBy('setting.name', 'ASC');

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    const meta: CustomMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };

    return {
      success: true,
      message: 'System settings retrieved successfully',
      data,
      meta: meta as any,
    };
  }

  async findById(id: string): Promise<SystemSettingEntity> {
    const setting = await this._settingRepo.findOne({
      where: { id, deletedDate: IsNull() },
    });

    if (!setting) {
      throw new NotFoundException(`Setting with ID '${id}' not found`);
    }

    return setting;
  }

  async getByKey(key: string): Promise<SystemSettingEntity> {
    const cacheKey = `${SystemSettingsService.CACHE_PREFIX}${key}`;
    const cached = await this._redisService.get<SystemSettingEntity>(cacheKey);
    if (cached) {
      return cached;
    }

    const setting = await this._settingRepo.findOne({
      where: { key, deletedDate: IsNull() },
    });

    if (!setting) {
      throw new NotFoundException(`Setting with key '${key}' not found`);
    }

    await this._redisService.set(cacheKey, setting, SystemSettingsService.CACHE_TTL_SECONDS);
    return setting;
  }

  async create(userId: string, data: CreateSystemSettingDto): Promise<CommonResponse<SystemSettingEntity>> {
    const existing = await this._settingRepo.findOne({
      where: { key: data.key, deletedDate: IsNull() },
    });

    if (existing) {
      throw new ConflictException(`Setting with key '${data.key}' already exists`);
    }

    const setting = this._settingRepo.create({
      id: uuidv4(),
      ...data,
      createdBy: userId,
      createdDate: new Date(),
      isActive: data.isActive ?? true,
    });

    const saved = await this._settingRepo.save(setting);
    await this._redisService.del(`${SystemSettingsService.CACHE_PREFIX}${saved.key}`);

    return {
      success: true,
      message: 'System setting created successfully',
      data: saved,
    };
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateSystemSettingDto,
  ): Promise<CommonResponse<SystemSettingEntity>> {
    const setting = await this.findById(id);

    Object.assign(setting, {
      ...dto,
      updatedBy: userId,
      updatedDate: new Date(),
    });

    const saved = await this._settingRepo.save(setting);
    await this._redisService.del(`${SystemSettingsService.CACHE_PREFIX}${saved.key}`);

    return {
      success: true,
      message: 'System setting updated successfully',
      data: saved,
    };
  }

  async bulkUpdate(
    userId: string,
    items: UpdateSystemSettingBulkItemDto[],
  ): Promise<CommonResponse> {
    for (const item of items) {
      const setting = await this._settingRepo.findOne({
        where: { id: item.id, deletedDate: IsNull() },
      });
      if (setting) {
        Object.assign(setting, {
          ...item,
          updatedBy: userId,
          updatedDate: new Date(),
        });
        await this._settingRepo.save(setting);
        await this._redisService.del(`${SystemSettingsService.CACHE_PREFIX}${setting.key}`);
      }
    }

    return {
      success: true,
      message: 'System settings bulk updated successfully',
    };
  }

  async delete(id: string, userId: string): Promise<CommonResponse> {
    const setting = await this.findById(id);

    setting.deletedBy = userId;
    setting.deletedDate = new Date();
    await this._settingRepo.save(setting);
    await this._redisService.del(`${SystemSettingsService.CACHE_PREFIX}${setting.key}`);

    return {
      success: true,
      message: 'System setting deleted successfully',
    };
  }
}
