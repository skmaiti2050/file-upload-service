import { IsOptional, IsString } from 'class-validator';

export class UploadFileDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
