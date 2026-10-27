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
import { CreateLocationDto, UpdateLocationDto } from '../dtos/location.dto';
import { LocationService } from '../services/location.service';

@ApiTags('Location')
@UseGuards(GatewayUserGuard, PermissionGuard)
@Controller('location')
@Audit('Location')
export class LocationController {
  constructor(private readonly _locationService: LocationService) {}

  @Public()
  @Get('active')
  @ApiOperation({ summary: 'Get all active locations (public, for dropdowns)' })
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
  @AuditDescription("Defined and created a new location: '{name}'")
  @ApiOperation({ summary: 'Create a new Location' })
  async create(@ReqContext() req: RequestContextDto, @Body() data: CreateLocationDto) {
    return await this._locationService.create(data, req.userId);
  }

  @Get()
  @PermissionRequired('View Location')
  @ApiOperation({ summary: 'Get all locations (paginated)' })
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
  @ApiOperation({ summary: 'Get all locations' })
  async getAllActive() {
    return await this._locationService.findAllGet();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a location by id' })
  async findOne(@Param('id') id: string) {
    return await this._locationService.findOne(id);
  }

  @Patch(':id')
  @PermissionRequired('Edit Location')
  @AuditDescription("Updated configurations for location '{identifier}'")
  @ApiOperation({ summary: 'Update a location' })
  async update(
    @ReqContext() req: RequestContextDto,
    @Param('id') id: string,
    @Body() data: UpdateLocationDto,
  ) {
    return await this._locationService.update(id, data, req.userId);
  }

  @Patch('status/:id')
  @PermissionRequired('Edit Location')
  @AuditDescription("Toggled status for location '{identifier}'")
  @ApiOperation({ summary: 'Toggle status of a location' })
  async updateStatus(@ReqContext() req: RequestContextDto, @Param('id') id: string) {
    return await this._locationService.updateStatus(id, req.userId);
  }

  @Delete(':id')
  @PermissionRequired('Delete Location')
  @AuditDescription("Removed location '{identifier}'")
  @ApiOperation({ summary: 'Delete a location' })
  async delete(@ReqContext() req: RequestContextDto, @Param('id') id: string) {
    return await this._locationService.delete(id, req.userId);
  }
}
