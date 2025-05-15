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
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { FileUploadThrottlerGuard } from '../common/guards/throttle.guard';
import { User } from '../users/entities/user.entity';
import { PaginationResult } from './dto/pagination-result.interface';
import { PaginationDto } from './dto/pagination.dto';
import { UploadFileDto, UploadFileSwaggerDto } from './dto/upload-file.dto';
import { File } from './entities/file.entity';
import { FilesService } from './files.service';

@ApiTags('files')
@Controller('files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-Auth')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @ApiOperation({ summary: 'Upload a new file' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileSwaggerDto })
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

  @ApiOperation({ summary: 'Get file by ID' })
  @ApiResponse({ status: 200, description: 'File retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'File not found' })
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

  @ApiOperation({ summary: 'List files for current user' })
  @ApiResponse({ status: 200, description: 'Files retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  async getUserFiles(
    @CurrentUser() user: User,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginationResult<File>> {
    return this.filesService.findAllByUser(user.id, paginationDto);
  }
}
