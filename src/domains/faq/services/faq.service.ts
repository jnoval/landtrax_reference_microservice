import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {  IsNull, Not, Repository } from 'typeorm';
import { CommonResponse, CustomMeta } from '../../../shared/common';
import FAQEntity from '../../../shared/infrastructure/database/entities/faq.entity';
import { uuidv4 } from '../../../shared/utils/uuid';
import {
  BulkDeleteFAQDto,
  BulkUpdateFAQStatusDto,
  CreateFAQDto,
  UpdateFAQDto,
} from '../dtos/faq.dto';

@Injectable()
export class FAQService {
  private readonly _logger = new Logger(FAQService.name);

  constructor(
    @InjectRepository(FAQEntity)
    private readonly _faqRepo: Repository<FAQEntity>,
  ) {}

  async create(data: CreateFAQDto, createdBy: string): Promise<CommonResponse<FAQEntity>> {
    const isDuplicateTitle = await this._faqRepo.findOne({
      where: { title: data.title, deletedDate: IsNull() },
    });
    if (isDuplicateTitle) {
      throw new ConflictException(`FAQ with title '${data.title}' already exists.`);
    }

    const faq = this._faqRepo.create({
      id: uuidv4(),
      ...data,
      isActive: true,
      createdBy,
      createdDate: new Date(),
    });

    const response = await this._faqRepo.save(faq);

    return {
      data: response,
      success: true,
      message: 'FAQ created successfully',
    };
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    isActive?: boolean,
  ): Promise<{ data: FAQEntity[]; meta: CustomMeta }> {
    const skip = (page - 1) * limit;

    const queryBuilder = this._faqRepo
      .createQueryBuilder('faq')
      .where('faq.deletedDate IS NULL');

    if (isActive !== undefined) {
      queryBuilder.andWhere('faq.isActive = :isActive', { isActive });
    }

    if (search) {
      queryBuilder.andWhere('(faq.title LIKE :search OR faq.content LIKE :search)', {
        search: `%${search}%`,
      });
    }

    queryBuilder.orderBy('faq.createdDate', 'DESC');

    const total = await queryBuilder.getCount();
    const data = await queryBuilder.skip(skip).take(limit).getMany();

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

  async findActive(search?: string): Promise<FAQEntity[]> {
    const qb = this._faqRepo
      .createQueryBuilder('faq')
      .where('faq.deletedDate IS NULL')
      .andWhere('faq.isActive = 1');

    if (search) {
      qb.andWhere('(faq.title LIKE :search OR faq.content LIKE :search)', {
        search: `%${search}%`,
      });
    }

    qb.orderBy('faq.createdDate', 'DESC');
    return await qb.getMany();
  }

  async findOne(id: string): Promise<FAQEntity> {
    const faq = await this._faqRepo.findOne({
      where: { id, deletedDate: IsNull() },
    });

    if (!faq) {
      throw new NotFoundException('FAQ not found');
    }

    return faq;
  }

  async update(id: string, data: UpdateFAQDto, updatedBy: string): Promise<CommonResponse<FAQEntity>> {
    const faq = await this.findOne(id);

    if (data.title && data.title !== faq.title) {
      const isDuplicateTitle = await this._faqRepo.findOne({
        where: { title: data.title, id: Not(id), deletedDate: IsNull() },
      });
      if (isDuplicateTitle) {
        throw new ConflictException(`FAQ with title '${data.title}' already exists.`);
      }
    }

    Object.assign(faq, {
      ...data,
      updatedBy,
      updatedDate: new Date(),
    });

    const response = await this._faqRepo.save(faq);

    return {
      data: response,
      success: true,
      message: 'FAQ updated successfully',
    };
  }

  async updateStatus(
    id: string,
    isActive: boolean,
    updatedBy: string,
  ): Promise<CommonResponse<FAQEntity>> {
    const faq = await this.findOne(id);

    faq.isActive = isActive;
    faq.updatedBy = updatedBy;
    faq.updatedDate = new Date();

    const response = await this._faqRepo.save(faq);

    return {
      data: response,
      success: true,
      message: 'FAQ status updated successfully',
    };
  }

  async bulkUpdateStatus(dto: BulkUpdateFAQStatusDto, updatedBy: string): Promise<CommonResponse> {
    await this._faqRepo
      .createQueryBuilder()
      .update(FAQEntity)
      .set({
        isActive: dto.isActive,
        updatedBy,
        updatedDate: new Date(),
      })
      .whereInIds(dto.ids)
      .andWhere('deletedDate IS NULL')
      .execute();

    return {
      success: true,
      message: 'FAQs status updated successfully',
    };
  }

  async delete(id: string, deletedBy: string): Promise<CommonResponse> {
    const faq = await this.findOne(id);

    faq.deletedBy = deletedBy;
    faq.deletedDate = new Date();
    await this._faqRepo.save(faq);

    return {
      success: true,
      message: 'FAQ deleted successfully',
    };
  }

  async bulkDelete(dto: BulkDeleteFAQDto, deletedBy: string): Promise<CommonResponse> {
    await this._faqRepo
      .createQueryBuilder()
      .update(FAQEntity)
      .set({
        deletedBy,
        deletedDate: new Date(),
      })
      .whereInIds(dto.ids)
      .andWhere('deletedDate IS NULL')
      .execute();

    return {
      success: true,
      message: 'FAQs deleted successfully',
    };
  }
}
