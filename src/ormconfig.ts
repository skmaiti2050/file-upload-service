import { ConfigService } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenvConfig({ path: '.env' });
const configService = new ConfigService();

const entitiesPath = join(__dirname, '**', '*.entity{.ts,.js}');
const migrationsPath = join(__dirname, 'migrations', '*{.ts,.js}');

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_DATABASE'),
  synchronize: false,
  logging: false,
  entities: [entitiesPath],
  migrations: [migrationsPath],
  // ssl: configService.get<string>('NODE_ENV') === 'production' ? true : false,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
