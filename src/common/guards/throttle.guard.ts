import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class FileUploadThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const user = req.user;

    if (!user || !user.id) {
      throw new Error(
        'User ID not found on request. Ensure JwtAuthGuard is used.',
      );
    }
    return user.id.toString();
  }
}
