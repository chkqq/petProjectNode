import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { WebsocketAuthService } from './auth/websocket-auth.service';
import { NotificationPayload } from './interfaces/notification-payload.interface';
import { NotificationSocketData } from './interfaces/socket-data.interface';

type NotificationSocket = Socket & { data: NotificationSocketData };

interface PingMessage {
  message?: string;
}

interface PongMessage {
  event: 'pong';
  data: {
    message: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationGateway.name);

  @WebSocketServer()
  private readonly io: Server;

  constructor(private readonly websocketAuthService: WebsocketAuthService) {}

  async handleConnection(client: NotificationSocket): Promise<void> {
    this.logger.log(`Client connected: ${client.id}`);

    try {
      const userId = await this.websocketAuthService.verifyJwtFromHandshake({
        authorization: client.handshake.headers.authorization,
        authToken: client.handshake.auth.token,
      });

      client.data.userId = userId;
      await client.join(userId);
      this.logger.log(`Client ${client.id} joined user room ${userId}`);
    } catch (error) {
      this.logger.warn(
        `Client ${client.id} disconnected by auth error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      client.disconnect(true);
    }
  }

  handleDisconnect(client: NotificationSocket): void {
    this.logger.log(
      `Client disconnected: ${client.id}, userId=${client.data.userId ?? 'none'}`,
    );
  }

  @SubscribeMessage('ping')
  handlePing(
    @MessageBody() data: PingMessage,
    @ConnectedSocket() client: NotificationSocket,
  ): PongMessage {
    this.logger.log(`Ping from client ${client.id}`);
    return {
      event: 'pong',
      data: {
        message: data.message ?? 'pong',
      },
    };
  }

  sendNotification(userId: string, payload: NotificationPayload): void {
    this.logger.log(`Sending notification to user ${userId}`);
    this.io.to(userId).emit('notification', payload);
  }
}
