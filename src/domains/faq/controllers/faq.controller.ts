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
import { Public } from '../../../shared/decorators/public.decorator';
import { ReqContext, RequestContextDto } from '../../../shared/decorators/req-context.decorator';
import { GatewayUserGuard } from '../../../shared/guards/gateway-user.guard';
import { PermissionGuard } from '../../../shared/guards/permission.guard';
import {
  BulkDeleteFAQDto,
  BulkUpdateFAQStatusDto,
  CreateFAQDto,
  UpdateFAQDto,
  UpdateFAQStatusDto,
} from '../dtos/faq.dto';
import { FAQService } from '../services/faq.service';

@ApiTags('FAQ Management')
@UseGuards(GatewayUserGuard, PermissionGuard)
@Controller('faq')
@Audit('FAQ Management')
export class FAQController {
  constructor(private readonly _faqService: FAQService) {}

  @Post()
  @PermissionRequired('Create FAQ')
  @AuditDescription("Published a new entry to the knowledge base: '{question}'")
  @ApiOperation({ summary: 'Create a new FAQ' })
  async create(@ReqContext() req: RequestContextDto, @Body() data: CreateFAQDto) {
    return await this._faqService.create(data, req.userId);
  }

  @Public()
  @Get('active-faqs')
  @ApiOperation({ summary: 'Get all active FAQs (public)' })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getActiveFaqs(@Query('search') search?: string) {
    return await this._faqService.findActive(search);
  }

  @Get()
  @PermissionRequired('View FAQ Management Page')
  @ApiOperation({ summary: 'Get all FAQs (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return await this._faqService.findAll(page, limit, search, isActive);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get FAQ by id' })
  async findOne(@Param('id') id: string) {
    return await this._faqService.findOne(id);
  }

  @Patch('bulk/status')
  @PermissionRequired('Edit FAQ')
  @ApiOperation({ summary: 'Bulk update FAQ status' })
  async bulkUpdateStatus(
    @ReqContext() req: RequestContextDto,
    @Body() data: BulkUpdateFAQStatusDto,
  ) {
    return await this._faqService.bulkUpdateStatus(data, req.userId);
  }

  @Delete('bulk/delete')
  @PermissionRequired('Delete FAQ')
  @ApiOperation({ summary: 'Bulk delete FAQs' })
  async bulkDelete(
    @ReqContext() req: RequestContextDto,
    @Body() data: BulkDeleteFAQDto,
  ) {
    return await this._faqService.bulkDelete(data, req.userId);
  }

  @Patch(':id/status')
  @PermissionRequired('Edit FAQ')
  @AuditDescription("Toggled visibility status for knowledge base article '{identifier}'")
  @ApiOperation({ summary: 'Update FAQ status' })
  async updateStatus(
    @ReqContext() req: RequestContextDto,
    @Param('id') id: string,
    @Body() data: UpdateFAQStatusDto,
  ) {
    return await this._faqService.updateStatus(id, data.isActive, req.userId);
  }

  @Patch(':id')
  @PermissionRequired('Edit FAQ')
  @AuditDescription("Updated content for knowledge base article '{identifier}'")
  @ApiOperation({ summary: 'Update FAQ' })
  async update(
    @ReqContext() req: RequestContextDto,
    @Param('id') id: string,
    @Body() data: UpdateFAQDto,
  ) {
    return await this._faqService.update(id, data, req.userId);
  }

  @Delete(':id')
  @PermissionRequired('Delete FAQ')
  @AuditDescription("Removed entry from knowledge base: '{identifier}'")
  @ApiOperation({ summary: 'Delete FAQ' })
  async delete(@ReqContext() req: RequestContextDto, @Param('id') id: string) {
    return await this._faqService.delete(id, req.userId);
  }
}
