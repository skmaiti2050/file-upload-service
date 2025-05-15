import { InjectQueue } from '@nestjs/bull';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { PaginationResult } from './dto/pagination-result.interface';
import { PaginationDto } from './dto/pagination.dto';
import { UploadFileDto } from './dto/upload-file.dto';
import { File, FileStatus } from './entities/file.entity';
import { Job, JobStatus } from './entities/job.entity';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private readonly filesRepository: Repository<File>,

    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,

    @InjectQueue('file-processing')
    private readonly fileProcessingQueue: Queue,
  ) {}

  async findOne(id: number): Promise<File | null> {
    return this.filesRepository.findOne({ where: { id } });
  }

  async findAllByUser(
    userId: number,
    paginationDto: PaginationDto,
  ): Promise<PaginationResult<File>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [files, total] = await this.filesRepository.findAndCount({
      where: { userId },
      order: { uploadedAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: files,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async uploadFile(
    file: Express.Multer.File,
    uploadFileDto: UploadFileDto,
    userId: number,
  ): Promise<File> {
    const newFile = this.filesRepository.create({
      userId,
      originalFilename: file.originalname,
      storagePath: file.path,
      title: uploadFileDto.title,
      description: uploadFileDto.description,
      status: FileStatus.UPLOADED,
    });

    const savedFile = await this.filesRepository.save(newFile);

    const job = this.jobsRepository.create({
      fileId: savedFile.id,
      jobType: 'process-file',
      status: JobStatus.QUEUED,
    });

    await this.jobsRepository.save(job);

    await this.fileProcessingQueue.add(
      'process-file',
      {
        fileId: savedFile.id,
        jobId: job.id,
        filePath: savedFile.storagePath,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    );

    return savedFile;
  }

  async updateFileStatus(
    fileId: number,
    status: FileStatus,
    extractedData?: string,
  ): Promise<File> {
    const file = await this.findOne(fileId);

    if (!file) {
      throw new NotFoundException(`File with ID ${fileId} not found`);
    }

    file.status = status;

    if (extractedData) {
      file.extractedData = extractedData;
    }

    return this.filesRepository.save(file);
  }

  async updateJobStatus(
    jobId: number,
    status: JobStatus,
    errorMessage?: string,
  ): Promise<Job> {
    const job = await this.jobsRepository.findOne({ where: { id: jobId } });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    job.status = status;

    if (status === JobStatus.PROCESSING) {
      job.startedAt = new Date();
    }

    if (status === JobStatus.COMPLETED || status === JobStatus.FAILED) {
      job.completedAt = new Date();

      if (errorMessage) {
        job.errorMessage = errorMessage;
      }
    }

    return this.jobsRepository.save(job);
  }
}
