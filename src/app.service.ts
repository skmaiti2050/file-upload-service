import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthCheckResponse } from './common/interfaces/health-check-response.interface';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  healthCheck(): HealthCheckResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      service: 'file-upload-service',
    };
  }
}
