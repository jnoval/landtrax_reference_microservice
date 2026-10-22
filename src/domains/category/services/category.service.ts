import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { CommonResponse, CustomMeta } from '../../../shared/common';
import { CategoryEntity } from '../../../shared/infrastructure/database/entities/category.entity';
import { isUUID, uuidv4 } from '../../../shared/utils/uuid';
import { CreateCategoryDto, UpdateCategoryDto } from '../dtos/category.dto';

@Injectable()
export class CategoryService {
  private readonly _logger = new Logger(CategoryService.name);

  constructor(
    @InjectRepository(CategoryEntity)
    private readonly _categoryRepo: Repository<CategoryEntity>,
  ) {}

  async create(data: CreateCategoryDto, createdBy: string): Promise<CommonResponse<CategoryEntity>> {
    const trimmedName = data.name.trim();
    const existing = await this._categoryRepo.findOne({
      where: { name: trimmedName, deletedDate: IsNull() },
    });

    if (existing) {
      throw new ConflictException(
        `Service category with name of ${trimmedName} already exists.`,
      );
    }

    const category = this._categoryRepo.create({
      id: uuidv4(),
      ...data,
      name: trimmedName,
      createdBy,
      createdDate: new Date(),
      updatedDate: null,
      updatedBy: null,
    });

    const saved = await this._categoryRepo.save(category);
    this._logger.log(`Created service category '${saved.name}' (${saved.id})`);

    return {
      message: 'Service category created',
      success: true,
      data: saved,
    };
  }

  async getAll(): Promise<CategoryEntity[]> {
    const queryBuilder = this._categoryRepo
      .createQueryBuilder('category')
      .where('category.deletedDate IS NULL')
      .orderBy('category.createdDate', 'DESC');

    const data = await queryBuilder.getMany();
    this._logger.log(`Retrieved ${data.length} categories`);
    return data;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{
    data: CategoryEntity[];
    meta: CustomMeta;
  }> {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(1000, Number(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const queryBuilder = this._categoryRepo
      .createQueryBuilder('category')
      .where('category.deletedDate IS NULL');

    if (search) {
      queryBuilder.andWhere('(category.name LIKE :search)', { search: `%${search}%` });
    }

    queryBuilder.orderBy('category.createdDate', 'DESC');

    const total = await queryBuilder.getCount();
    queryBuilder.skip(skip).take(limitNum);
    const data = await queryBuilder.getMany();

    this._logger.log(`Retrieved ${data.length} categories`);

    return {
      data,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  }

  async findOne(id: string): Promise<CategoryEntity> {
    if (!isUUID(id)) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const category = await this._categoryRepo.findOne({
      where: {
        id,
        deletedDate: IsNull(),
      },
      relations: ['services'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async update(
    id: string,
    data: UpdateCategoryDto,
    updatedBy: string,
  ): Promise<CommonResponse<CategoryEntity>> {
    if (!isUUID(id)) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const category = await this.findOne(id);

    if (data.name && data.name.trim() !== category.name) {
      const trimmedName = data.name.trim();
      const duplicate = await this._categoryRepo.findOne({
        where: { id: Not(id), name: trimmedName, deletedDate: IsNull() },
      });

      if (duplicate) {
        throw new ConflictException(
          `Service category with name of ${trimmedName} already exists.`,
        );
      }
    }

    Object.assign(category, {
      ...data,
      name: data.name ? data.name.trim() : category.name,
      updatedBy,
      updatedDate: new Date(),
    });

    const saved = await this._categoryRepo.save(category);
    this._logger.log(`Updated service category '${saved.name}' (${saved.id})`);

    return {
      message: 'Service category updated',
      success: true,
      data: saved,
    };
  }

  async delete(id: string, deletedBy: string): Promise<CommonResponse<CategoryEntity>> {
    if (!isUUID(id)) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const category = await this.findOne(id);

    if (category?.services && category.services.length > 0) {
      throw new ConflictException(
        'Cannot delete service category. This service category is currently being used in service catalog(s).',
      );
    }

    category.deletedBy = deletedBy;
    category.deletedDate = new Date();

    const saved = await this._categoryRepo.save(category);
    this._logger.log(`Soft deleted service category '${saved.name}' (${saved.id})`);

    return {
      message: 'Service category deleted',
      success: true,
      data: saved,
    };
  }

  async findByName(name: string): Promise<CategoryEntity | null> {
    const trimmedName = name.trim();
    return await this._categoryRepo.findOne({
      where: {
        name: trimmedName,
        deletedDate: IsNull(),
      },
    });
  }
}
