import {
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

const MAX_AVATAR_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'];

@Injectable()
export class AvatarFileValidationPipe
  implements PipeTransform<Express.Multer.File | undefined, Express.Multer.File>
{
  transform(file: Express.Multer.File | undefined): Express.Multer.File {
    if (!file) {
      throw new BadRequestException('Avatar file is required');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Avatar must be jpeg or png');
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      throw new BadRequestException('Avatar size must be less than 10 MB');
    }

    return file;
  }
}
