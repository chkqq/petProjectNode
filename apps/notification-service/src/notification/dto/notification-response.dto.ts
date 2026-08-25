import { ApiProperty } from '@nestjs/swagger';

export class NotificationResponseDto {
  @ApiProperty({ example: 'Notification was sent' })
  message: string;
}
