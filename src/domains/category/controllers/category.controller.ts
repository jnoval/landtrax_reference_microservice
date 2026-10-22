import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Audit } from '../../../shared/decorators/audit.decorator';
import { AuditDescription } from '../../../shared/decorators/audit-description.decorator';
import { PermissionRequired } from '../../../shared/decorators/authorization.decorators';
import { ReqContext, RequestContextDto } from '../../../shared/decorators/req-context.decorator';
import { GatewayUserGuard } from '../../../shared/guards/gateway-user.guard';
import { PermissionGuard } from '../../../shared/guards/permission.guard';
import { CreateCategoryDto, UpdateCategoryDto } from '../dtos/category.dto';
import { CategoryService } from '../services/category.service';

@ApiTags('Service Category')
@UseGuards(GatewayUserGuard, PermissionGuard)
@Controller('category')
@Audit('Service Category')
export class CategoryController {
  constructor(private readonly _categoryService: CategoryService) {}

  @Post()
  @PermissionRequired('Create Service Category')
  @AuditDescription("Defined and created a new service category: '{name}'")
  @ApiOperation({ summary: 'Create a new category' })
  async create(@ReqContext() req: RequestContextDto, @Body() data: CreateCategoryDto) {
    return await this._categoryService.create(data, req.userId);
  }

  @Get()
  @PermissionRequired('View Services Catalogs')
  @AuditDescription('Viewed list of active service categories')
  @ApiOperation({ summary: 'Get all categories with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    return await this._categoryService.findAll(page, limit, search);
  }

  @Get('get-all')
  @PermissionRequired('View Services Catalogs')
  @AuditDescription('Retrieved the full registry of service categories')
  @ApiOperation({ summary: 'Get all categories without pagination' })
  async getAll() {
    return await this._categoryService.getAll();
  }

  @Get(':id')
  @PermissionRequired('View Services Catalogs')
  @AuditDescription("Viewed details for category '{identifier}'")
  @ApiOperation({ summary: 'Get a category by id' })
  async findOne(@Param('id') id: string) {
    return await this._categoryService.findOne(id);
  }

  @Patch(':id')
  @PermissionRequired('Edit Service Category')
  @AuditDescription("Updated configurations for category '{identifier}'")
  @ApiOperation({ summary: 'Update a category' })
  async update(
    @ReqContext() req: RequestContextDto,
    @Param('id') id: string,
    @Body() data: UpdateCategoryDto,
  ) {
    return await this._categoryService.update(id, data, req.userId);
  }

  @Delete(':id')
  @PermissionRequired('Delete Service Category')
  @AuditDescription("Removed categorization for '{identifier}'")
  @ApiOperation({ summary: 'Delete a category' })
  async delete(@ReqContext() req: RequestContextDto, @Param('id') id: string) {
    return await this._categoryService.delete(id, req.userId);
  }
}
