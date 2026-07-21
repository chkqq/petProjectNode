import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AvatarsService } from './avatars.service';
import { AvatarResponseDto } from './dto/avatar-response.dto';
import { AvatarFileValidationPipe } from './pipes/avatar-file-validation.pipe';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestUser } from '../auth/interfaces/request-user.interface';

@ApiTags('avatars')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profile/my/avatars')
export class AvatarsController {
  constructor(private readonly avatarsService: AvatarsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @ApiCreatedResponse({ type: AvatarResponseDto })
  uploadAvatar(
    @CurrentUser() user: RequestUser,
    @UploadedFile(new AvatarFileValidationPipe())
    file: Express.Multer.File,
  ): Promise<AvatarResponseDto> {
    return this.avatarsService.uploadAvatar(user.id, file);
  }

  @Get()
  @ApiOkResponse({ type: [AvatarResponseDto] })
  findMyAvatars(
    @CurrentUser() user: RequestUser,
  ): Promise<AvatarResponseDto[]> {
    return this.avatarsService.findMyAvatars(user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Avatar was soft deleted' })
  deleteAvatar(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.avatarsService.deleteAvatar(user.id, id);
  }
}
