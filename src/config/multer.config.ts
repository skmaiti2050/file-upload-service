import { ConfigService } from '@nestjs/config';
import { MulterModuleOptions } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

export const multerConfig = (
  configService: ConfigService,
): MulterModuleOptions => {
  const uploadDestination = configService.get<string>(
    'UPLOAD_DESTINATION',
    './uploads',
  );
  const maxFileSize = configService.get<number>('MAX_FILE_SIZE', 10485760);

  if (!existsSync(uploadDestination)) {
    mkdirSync(uploadDestination, { recursive: true });
  }

  return {
    storage: diskStorage({
      destination: uploadDestination,
      filename: (_req, file, callback) => {
        const uniqueSuffix = uuid();
        const ext = extname(file.originalname);
        callback(null, `${uniqueSuffix}${ext}`);
      },
    }),
    limits: {
      fileSize: maxFileSize,
    },
  };
};
