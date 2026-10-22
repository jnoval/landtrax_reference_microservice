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
import { CreateRequirementMappingDto, UpdateRequirementMappingDto } from '../dtos/create-requirement-mapping.dto';
import { RequirementMappingService } from '../services/requirement-mapping.service';

@ApiTags('Requirement Mapping')
@UseGuards(GatewayUserGuard, PermissionGuard)
@Controller('requirement-mapping')
@Audit('Requirement Mapping')
export class RequirementMappingController {
  constructor(private readonly _mappingService: RequirementMappingService) {}

  @Post()
  @PermissionRequired('Create Requirement')
  @AuditDescription('Created requirement mapping')
  @ApiOperation({ summary: 'Create requirement mapping' })
  async create(@Body() data: CreateRequirementMappingDto) {
    return await this._mappingService.create(data);
  }

  @Get()
  @PermissionRequired('View Services Catalogs')
  @ApiOperation({ summary: 'Get all requirement mappings' })
  async findAll(@Query() query: any) {
    return await this._mappingService.findAll(query);
  }

  @Get('service/:serviceId')
  @PermissionRequired('View Services Catalogs')
  @ApiOperation({ summary: 'Get requirement mappings by service ID' })
  async findByServiceId(@Param('serviceId') serviceId: string) {
    return await this._mappingService.findByServiceId(serviceId);
  }

  @Get(['source/:id', 'source-requirement/:id'])
  @PermissionRequired('View Services Catalogs')
  @ApiOperation({ summary: 'Get requirement mappings by source requirement ID' })
  async findBySourceRequirement(@Param('id') id: string) {
    return await this._mappingService.findBySourceRequirement(id);
  }

  @Get(['target/:id', 'target-requirement/:id'])
  @PermissionRequired('View Services Catalogs')
  @ApiOperation({ summary: 'Get requirement mappings by target requirement ID' })
  async findByTargetRequirement(@Param('id') id: string) {
    return await this._mappingService.findByTargetRequirement(id);
  }

  @Get(':id')
  @PermissionRequired('View Services Catalogs')
  @ApiOperation({ summary: 'Get requirement mapping by ID' })
  async findOne(@Param('id') id: string) {
    return await this._mappingService.findOne(id);
  }

  @Patch(':id')
  @PermissionRequired('Edit Requirement')
  @AuditDescription('Updated requirement mapping')
  @ApiOperation({ summary: 'Update requirement mapping' })
  async update(@Param('id') id: string, @Body() data: UpdateRequirementMappingDto) {
    return await this._mappingService.update(id, data);
  }

  @Delete(':id')
  @PermissionRequired('Delete Requirement')
  @AuditDescription('Deleted requirement mapping')
  @ApiOperation({ summary: 'Delete requirement mapping' })
  async delete(@Param('id') id: string) {
    return await this._mappingService.delete(id);
  }
}
