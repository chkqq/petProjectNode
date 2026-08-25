import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class SendTestNotificationDto {
  @ApiProperty({ example: '4dfb1112-9e2f-4b6d-9f9f-2f3fb38b57b7' })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: 'Hello from notification-service' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  message: string;
}
