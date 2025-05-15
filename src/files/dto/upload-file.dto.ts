import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UploadFileDto {
  @ApiProperty({ required: false, description: 'Title of the file' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false, description: 'Description of the file' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UploadFileSwaggerDto extends UploadFileDto{
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File to upload',
  })
  file: Express.Multer.File;
}
