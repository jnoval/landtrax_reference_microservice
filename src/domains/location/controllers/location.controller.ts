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
import { CreateRegistryOfDeedDto, UpdateRegistryOfDeedDto } from '../dtos/location.dto';
import { LocationService } from '../services/location.service';

@ApiTags('Registry of Deed')
@UseGuards(GatewayUserGuard, PermissionGuard)
@Controller('registry-of-deed')
@Audit('Registry of Deed')
export class LocationController {
  constructor(private readonly _locationService: LocationService) {}

  @Public()
  @Get('active')
  @ApiOperation({ summary: 'Get all active registry of deeds (public, for dropdowns)' })
  async findAllActive() {
    return await this._locationService.findAllActive();
  }

  @Get('by-company-user/:userId')
  @ApiOperation({ summary: 'Get active locations by company user' })
  async findByCompanyUser(@Param('userId') userId: string) {
    return await this._locationService.findByCompanyUser(userId);
  }

  @Post()
  @PermissionRequired('Create Location')
  @AuditDescription("Defined and created a new registry of deed: '{name}'")
  @ApiOperation({ summary: 'Create a new Registry of Deed' })
  async create(@ReqContext() req: RequestContextDto, @Body() data: CreateRegistryOfDeedDto) {
    return await this._locationService.create(data, req.userId);
  }

  @Get()
  @PermissionRequired('View Location')
  @ApiOperation({ summary: 'Get all registry of deeds (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    return await this._locationService.findAll(page, limit, search);
  }

  @Get('all-active')
  @ApiOperation({ summary: 'Get all registry of deeds' })
  async getAllActive() {
    return await this._locationService.findAllGet();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a registry of deed by id' })
  async findOne(@Param('id') id: string) {
    return await this._locationService.findOne(id);
  }

  @Patch(':id')
  @PermissionRequired('Edit Location')
  @AuditDescription("Updated configurations for registry of deed '{identifier}'")
  @ApiOperation({ summary: 'Update a registry of deed' })
  async update(
    @ReqContext() req: RequestContextDto,
    @Param('id') id: string,
    @Body() data: UpdateRegistryOfDeedDto,
  ) {
    return await this._locationService.update(id, data, req.userId);
  }

  @Patch('status/:id')
  @PermissionRequired('Edit Location')
  @AuditDescription("Toggled status for registry of deed '{identifier}'")
  @ApiOperation({ summary: 'Toggle status of a registry of deed' })
  async updateStatus(@ReqContext() req: RequestContextDto, @Param('id') id: string) {
    return await this._locationService.updateStatus(id, req.userId);
  }

  @Delete(':id')
  @PermissionRequired('Delete Location')
  @AuditDescription("Removed registry of deed '{identifier}'")
  @ApiOperation({ summary: 'Delete a registry of deed' })
  async delete(@ReqContext() req: RequestContextDto, @Param('id') id: string) {
    return await this._locationService.remove(id, req.userId);
  }
}
