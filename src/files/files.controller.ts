import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { FileUploadThrottlerGuard } from '../common/guards/throttle.guard';
import { User } from '../users/entities/user.entity';
import { PaginationResult } from './dto/pagination-result.interface';
import { PaginationDto } from './dto/pagination.dto';
import { UploadFileDto } from './dto/upload-file.dto';
import { File } from './entities/file.entity';
import { FilesService } from './files.service';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseGuards(FileUploadThrottlerGuard)
  @Throttle({ fileUpload: {} })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto,
    @CurrentUser() user: User,
  ): Promise<File> {
    return this.filesService.uploadFile(file, uploadFileDto, user.id);
  }

  @Get(':id')
  async getFileById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<File> {
    const file = await this.filesService.findOne(id);

    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    if (file.userId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to access this file',
      );
    }

    return file;
  }

  @Get()
  async getUserFiles(
    @CurrentUser() user: User,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginationResult<File>> {
    return this.filesService.findAllByUser(user.id, paginationDto);
  }
}
