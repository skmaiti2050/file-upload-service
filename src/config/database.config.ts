import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const databaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const entitiesPath = join(__dirname, '..', '**', '*.entity.{ts,js}');

  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE'),
    entities: [entitiesPath],
    synchronize: true,
    ssl: true
    // ssl: configService.get<string>('NODE_ENV') === 'production' ? true : false,
    // autoLoadEntities: true,
  };
};
