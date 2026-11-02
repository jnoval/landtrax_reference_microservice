import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './shared/decorators/public.decorator';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Microservice health status' })
  getHealth() {
    return this.appService.getHealth();
  }

  @Public()
  @Get('version')
  @ApiOperation({ summary: 'Version endpoint' })
  @ApiResponse({ status: 200, description: 'Microservice version information' })
  getVersion() {
    return this.appService.getVersion();
  }
}
