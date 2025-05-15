import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import * as crypto from 'crypto';
import * as fs from 'fs';
import { promisify } from 'util';
import { ProcessFileJobData } from '../dto/process-file-job-data.interface';
import { FileStatus } from '../entities/file.entity';
import { JobStatus } from '../entities/job.entity';
import { FilesService } from '../files.service';

const readFileAsync = promisify(fs.readFile);

@Processor('file-processing')
export class FileProcessor {
  private readonly logger = new Logger(FileProcessor.name);

  constructor(private readonly filesService: FilesService) {}

  @Process('process-file')
  async processFile(job: Job<ProcessFileJobData>) {
    this.logger.debug(
      `Processing file job ${job.id} for file ID: ${job.data.fileId}`,
    );

    try {
      await this.filesService.updateFileStatus(
        job.data.fileId,
        FileStatus.PROCESSING,
      );
      await this.filesService.updateJobStatus(
        job.data.jobId,
        JobStatus.PROCESSING,
      );

      const fileBuffer = await readFileAsync(job.data.filePath);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      const fileInfo = {
        hash,
        size: fileBuffer.length,
        processedAt: new Date().toISOString(),
      };

      await this.filesService.updateFileStatus(
        job.data.fileId,
        FileStatus.PROCESSED,
        JSON.stringify(fileInfo),
      );

      await this.filesService.updateJobStatus(
        job.data.jobId,
        JobStatus.COMPLETED,
      );

      this.logger.debug(
        `File processing completed for file ID: ${job.data.fileId}`,
      );

      return fileInfo;
    } catch (error) {
      this.logger.error(
        `Error processing file ID: ${job.data.fileId}`,
        error.stack,
      );

      await this.filesService.updateFileStatus(
        job.data.fileId,
        FileStatus.FAILED,
      );

      await this.filesService.updateJobStatus(
        job.data.jobId,
        JobStatus.FAILED,
        error.message,
      );

      throw error;
    }
  }
}
