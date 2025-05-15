import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';
import { HealthCheckResponse } from './common/interfaces/health-check-response.interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Check application health status' })
  @ApiResponse({ status: 200, description: 'Application is healthy' })
  @Public()
  @Get('health')
  healthCheck(): HealthCheckResponse {
    return this.appService.healthCheck();
  }
}
