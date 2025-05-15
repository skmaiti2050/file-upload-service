import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';
import { HealthCheckResponse } from './common/interfaces/health-check-response.interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('health')
  healthCheck(): HealthCheckResponse {
    return this.appService.healthCheck();
  }
}
