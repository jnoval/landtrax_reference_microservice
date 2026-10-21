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
import { Public } from '../../../shared/decorators/public.decorator';
import { ReqContext, RequestContextDto } from '../../../shared/decorators/req-context.decorator';
import { GatewayUserGuard } from '../../../shared/guards/gateway-user.guard';
import { PermissionGuard } from '../../../shared/guards/permission.guard';
import {
  CreateSystemSettingDto,
  UpdateSystemSettingBulkItemDto,
  UpdateSystemSettingDto,
} from '../dtos/system-settings.dto';
import { SystemSettingsService } from '../services/system-settings.service';

@ApiTags('System Settings')
@UseGuards(GatewayUserGuard, PermissionGuard)
@Controller('system-settings')
@Audit('System Settings')
export class SystemSettingsController {
  constructor(private readonly _systemSettingsService: SystemSettingsService) {}

  @Post()
  @PermissionRequired('Edit Settings Configuration')
  @AuditDescription("Created new system setting '{key}'")
  @ApiOperation({ summary: 'Create a new system setting' })
  async create(
    @ReqContext() req: RequestContextDto,
    @Body() data: CreateSystemSettingDto,
  ) {
    return await this._systemSettingsService.create(req.userId, data);
  }

  @Get()
  @PermissionRequired('View Settings Configuration')
  @AuditDescription('Viewed system settings')
  @ApiOperation({ summary: 'Get all system settings with pagination' })
  async findAll(@Query() query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    return await this._systemSettingsService.findAll(page, limit, query);
  }

  @Public()
  @Get('key/:key')
  @ApiOperation({ summary: 'Get system setting by key' })
  async getByKey(@Param('key') key: string) {
    return await this._systemSettingsService.getByKey(key);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get system setting by ID' })
  async findById(@Param('id') id: string) {
    return await this._systemSettingsService.findById(id);
  }

  @Patch('bulk')
  @PermissionRequired('Edit Settings Configuration')
  @AuditDescription('Updated multiple system configuration settings in a single operation')
  @ApiOperation({ summary: 'Update system settings in bulk' })
  async updateBulk(
    @ReqContext() req: RequestContextDto,
    @Body() data: UpdateSystemSettingBulkItemDto[],
  ) {
    return await this._systemSettingsService.bulkUpdate(req.userId, data);
  }

  @Patch(':id')
  @PermissionRequired('Edit Settings Configuration')
  @AuditDescription("Modified the value or configuration for system setting '{identifier}'")
  @ApiOperation({ summary: 'Update system setting' })
  async update(
    @ReqContext() req: RequestContextDto,
    @Param('id') id: string,
    @Body() data: UpdateSystemSettingDto,
  ) {
    return await this._systemSettingsService.update(req.userId, id, data);
  }

  @Delete(':id')
  @PermissionRequired('Delete Settings Configuration')
  @AuditDescription("Deleted system setting '{identifier}'")
  @ApiOperation({ summary: 'Delete system setting' })
  async delete(@ReqContext() req: RequestContextDto, @Param('id') id: string) {
    return await this._systemSettingsService.delete(id, req.userId);
  }
}
