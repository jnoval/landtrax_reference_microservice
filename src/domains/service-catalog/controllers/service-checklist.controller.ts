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
import { GatewayUserGuard } from '../../../shared/guards/gateway-user.guard';
import { PermissionGuard } from '../../../shared/guards/permission.guard';
import { CreateServiceChecklistDto, ReorderItemDto, UpdateServiceChecklistDto } from '../dtos/create-service-checklist.dto';
import { ServiceChecklistService } from '../services/service-checklist.service';

@ApiTags('Service Checklist')
@UseGuards(GatewayUserGuard, PermissionGuard)
@Controller('service-checklist')
@Audit('Service Checklist')
export class ServiceChecklistController {
  constructor(private readonly _checklistService: ServiceChecklistService) {}

  @Post()
  @PermissionRequired('Create Service Catalog')
  @AuditDescription('Added requirement to service checklist')
  @ApiOperation({ summary: 'Add requirement to service checklist' })
  async create(@Body() data: CreateServiceChecklistDto) {
    return await this._checklistService.create(data);
  }

  @Get()
  @PermissionRequired('View Services Catalogs')
  @ApiOperation({ summary: 'Get all service checklist items' })
  async findAll(@Query() query: any) {
    return await this._checklistService.findAll(query);
  }

  @Get('service/:serviceId')
  @PermissionRequired('View Services Catalogs')
  @ApiOperation({ summary: 'Get checklist items by service ID' })
  async findByServiceId(@Param('serviceId') serviceId: string) {
    return await this._checklistService.findByServiceId(serviceId);
  }

  @Get(':id')
  @PermissionRequired('View Services Catalogs')
  @ApiOperation({ summary: 'Get checklist item by ID' })
  async findOne(@Param('id') id: string) {
    return await this._checklistService.findOne(id);
  }

  @Patch('reorder')
  @PermissionRequired('Edit Service Catalog')
  @ApiOperation({ summary: 'Reorder checklist items' })
  async reorder(@Body() items: ReorderItemDto[]) {
    return await this._checklistService.reorder(items);
  }

  @Patch(':id')
  @PermissionRequired('Edit Service Catalog')
  @AuditDescription('Updated service checklist item')
  @ApiOperation({ summary: 'Update service checklist item' })
  async update(@Param('id') id: string, @Body() data: UpdateServiceChecklistDto) {
    return await this._checklistService.update(id, data);
  }

  @Delete(':id')
  @PermissionRequired('Delete Service Catalog')
  @AuditDescription('Removed requirement from service checklist')
  @ApiOperation({ summary: 'Delete service checklist item' })
  async delete(@Param('id') id: string) {
    return await this._checklistService.delete(id);
  }
}
