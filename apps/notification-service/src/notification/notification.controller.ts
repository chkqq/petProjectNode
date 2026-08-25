import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiAcceptedResponse, ApiTags } from '@nestjs/swagger';

import { NotificationResponseDto } from './dto/notification-response.dto';
import { SendTestNotificationDto } from './dto/send-test-notification.dto';
import { NotificationService } from './notification.service';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('send')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiAcceptedResponse({ type: NotificationResponseDto })
  async sendTestNotification(
    @Body() dto: SendTestNotificationDto,
  ): Promise<NotificationResponseDto> {
    await this.notificationService.sendTestNotification(dto.userId, dto.message);
    return { message: 'Notification was sent' };
  }
}
