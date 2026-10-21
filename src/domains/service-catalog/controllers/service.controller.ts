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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Audit } from '../../../shared/decorators/audit.decorator';
import { AuditDescription } from '../../../shared/decorators/audit-description.decorator';
import { PermissionRequired } from '../../../shared/decorators/authorization.decorators';
import { ReqContext, RequestContextDto } from '../../../shared/decorators/req-context.decorator';
import { GatewayUserGuard } from '../../../shared/guards/gateway-user.guard';
import { PermissionGuard } from '../../../shared/guards/permission.guard';
import { BulkDeleteServiceDto } from '../dtos/bulk-delete-service.dto';
import { BulkUpdateServiceStatusDto } from '../dtos/bulk-update-service-status.dto';
import { CreateServiceDto } from '../dtos/create-service.dto';
import { UpdateServiceDto } from '../dtos/update-service.dto';
import { UpdateServiceStatusDto } from '../dtos/update-service-status.dto';
import { ServiceCatalogService } from '../services/service.service';

@ApiTags('Service Catalog')
@UseGuards(GatewayUserGuard, PermissionGuard)
@Controller('service')
@Audit('Service Catalog')
export class ServiceCatalogController {
  constructor(private readonly _serviceService: ServiceCatalogService) {}

  @Post()
  @PermissionRequired('Create Service Catalog')
  @AuditDescription("Defined and added a new professional service offering: '{name}'")
  @ApiOperation({ summary: 'Create a new service' })
  async create(@ReqContext() req: RequestContextDto, @Body() data: CreateServiceDto) {
    return await this._serviceService.create(req.userId, data);
  }

  @Get()
  @PermissionRequired('View Services Catalogs')
  @AuditDescription('Accessed the directory of all professional service offerings')
  @ApiOperation({ summary: 'Get all services with pagination' })
  async findAll(@Query() query: any) {
    return await this._serviceService.findAll(query);
  }

  @Get(':id')
  @PermissionRequired('View Services Catalogs')
  @ApiOperation({ summary: 'Get service by id' })
  async findOne(@Param('id') id: string) {
    return await this._serviceService.findOne(id);
  }

  @Patch('bulk/status')
  @PermissionRequired('Edit Service Catalog')
  @ApiOperation({ summary: 'Bulk update service statuses' })
  async bulkUpdateStatus(@Body() data: BulkUpdateServiceStatusDto) {
    return await this._serviceService.bulkUpdateStatus(data);
  }

  @Delete('bulk/delete')
  @PermissionRequired('Delete Service Catalog')
  @ApiOperation({ summary: 'Bulk delete services' })
  async bulkDelete(@Body() data: BulkDeleteServiceDto) {
    return await this._serviceService.bulkDelete(data);
  }

  @Patch(':id/status')
  @PermissionRequired('Edit Service Catalog')
  @ApiOperation({ summary: 'Update service status' })
  async updateStatus(@Param('id') id: string, @Body() data: UpdateServiceStatusDto) {
    return await this._serviceService.updateStatus(id, data);
  }

  @Patch(':id')
  @PermissionRequired('Edit Service Catalog')
  @AuditDescription("Modified specifications for professional service offering: '{name}'")
  @ApiOperation({ summary: 'Update service' })
  async update(
    @ReqContext() req: RequestContextDto,
    @Param('id') id: string,
    @Body() data: UpdateServiceDto,
  ) {
    return await this._serviceService.update(req.userId, id, data);
  }

  @Delete(':id')
  @PermissionRequired('Delete Service Catalog')
  @AuditDescription('Removed a professional service offering from the catalog')
  @ApiOperation({ summary: 'Delete service' })
  async delete(@Param('id') id: string) {
    return await this._serviceService.delete(id);
  }
}
