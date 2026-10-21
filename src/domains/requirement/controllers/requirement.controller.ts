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
import {
  BulkDeleteRequirementDto,
  BulkUpdateRequirementStatusDto,
  CreateRequirementDto,
  UpdateRequirementDto,
  UpdateRequirementStatusDto,
} from '../dtos/create-requirement.dto';
import { RequirementService } from '../services/requirement.service';

@ApiTags('Requirement')
@UseGuards(GatewayUserGuard, PermissionGuard)
@Controller('requirement')
@Audit('Requirement')
export class RequirementController {
  constructor(private readonly _requirementService: RequirementService) {}

  @Post()
  @PermissionRequired('Create Requirement')
  @AuditDescription("Defined and added a new document requirement: '{name}'")
  @ApiOperation({ summary: 'Create a new requirement' })
  async create(@ReqContext() req: RequestContextDto, @Body() data: CreateRequirementDto) {
    return await this._requirementService.create(req.userId, data);
  }

  @Get()
  @PermissionRequired('View Services Catalogs')
  @ApiOperation({ summary: 'Get all requirements with pagination' })
  async findAll(@Query() query: any) {
    return await this._requirementService.findAll(query);
  }

  @Get('code/:code')
  @PermissionRequired('View Services Catalogs')
  @ApiOperation({ summary: 'Get requirement by code' })
  async findByCode(@Param('code') code: string) {
    return await this._requirementService.findByCode(code);
  }

  @Get(':id')
  @PermissionRequired('View Services Catalogs')
  @ApiOperation({ summary: 'Get requirement by id' })
  async findOne(@Param('id') id: string) {
    return await this._requirementService.findOne(id);
  }

  @Patch('bulk/status')
  @PermissionRequired('Edit Requirement')
  @ApiOperation({ summary: 'Bulk update requirement status' })
  async bulkUpdateStatus(@Body() data: BulkUpdateRequirementStatusDto) {
    return await this._requirementService.bulkUpdateStatus(data);
  }

  @Delete('bulk/delete')
  @PermissionRequired('Delete Requirement')
  @ApiOperation({ summary: 'Bulk delete requirements' })
  async bulkDelete(@Body() data: BulkDeleteRequirementDto) {
    return await this._requirementService.bulkDelete(data);
  }

  @Patch(':id/status')
  @PermissionRequired('Edit Requirement')
  @ApiOperation({ summary: 'Update requirement status' })
  async updateStatus(@Param('id') id: string, @Body() data: UpdateRequirementStatusDto) {
    return await this._requirementService.updateStatus(id, data);
  }

  @Patch(':id')
  @PermissionRequired('Edit Requirement')
  @AuditDescription("Modified specifications for document requirement: '{name}'")
  @ApiOperation({ summary: 'Update requirement' })
  async update(
    @ReqContext() req: RequestContextDto,
    @Param('id') id: string,
    @Body() data: UpdateRequirementDto,
  ) {
    return await this._requirementService.update(req.userId, id, data);
  }

  @Delete(':id')
  @PermissionRequired('Delete Requirement')
  @AuditDescription('Removed a document requirement from the system')
  @ApiOperation({ summary: 'Delete requirement' })
  async delete(@Param('id') id: string) {
    return await this._requirementService.delete(id);
  }
}
