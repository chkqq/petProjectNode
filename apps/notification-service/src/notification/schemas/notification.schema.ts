import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { NotificationType } from '../interfaces/notification-payload.interface';

export type NotificationDocument = HydratedDocument<NotificationRecord>;

@Schema({ collection: 'notifications', timestamps: true })
export class NotificationRecord {
  @Prop({ required: true, index: true })
  recipientUserId: string;

  @Prop({ required: true })
  type: NotificationType;

  @Prop({ required: true })
  fromUserId: string;

  @Prop({ required: true })
  toUserId: string;

  @Prop({ required: true })
  amount: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  occurredAt: Date;
}

export const NotificationSchema =
  SchemaFactory.createForClass(NotificationRecord);
