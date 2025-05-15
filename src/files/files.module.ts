import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileUploadThrottlerGuard } from '../common/guards/throttle.guard';
import { multerConfig } from '../config/multer.config';
import { File } from './entities/file.entity';
import { Job } from './entities/job.entity';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FileProcessor } from './processors/file.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([File, Job]),
    BullModule.registerQueue({
      name: 'file-processing',
    }),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: multerConfig,
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService, FileProcessor, FileUploadThrottlerGuard],
})
export class FilesModule {}
