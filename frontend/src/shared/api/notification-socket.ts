import { io, type Socket } from 'socket.io-client';

import type { NotificationPayload } from './types';

interface ServerToClientEvents {
  notification: (payload: NotificationPayload) => void;
  pong: (payload: { message: string }) => void;
}

interface ClientToServerEvents {
  ping: (payload: { message?: string }) => void;
}

export type NotificationSocket = Socket<
  ServerToClientEvents,
  ClientToServerEvents
>;

const NOTIFICATION_WS_URL =
  import.meta.env.VITE_NOTIFICATION_WS_URL ?? 'http://localhost:3001';

export function createNotificationSocket(token: string): NotificationSocket {
  return io(NOTIFICATION_WS_URL, {
    autoConnect: false,
    auth: {
      token,
    },
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}
