import type { NotificationPayload } from '../../../shared/api/types';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { EmptyState } from '../../../shared/ui/EmptyState';

interface NotificationsPanelProps {
  userId?: string;
  notifications: NotificationPayload[];
  status: string;
  loading: boolean;
  isAuthorized: boolean;
  onPing: () => void;
  onSendTestNotification: () => void;
  onClear: () => void;
}

export function NotificationsPanel({
  userId,
  notifications,
  status,
  isAuthorized,
  onPing,
  onSendTestNotification,
  onClear,
}: NotificationsPanelProps) {
  return (
    <Card>
      <div className="space-y-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-300">
            Notification Service
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            Realtime notifications
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Socket.io connection to notification-service. The backend joins your
            socket to a room named by your user id.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm">
          <p className="text-slate-400">Socket status</p>
          <p className="mt-1 text-emerald-200">{status}</p>
          <p className="mt-2 break-all text-xs text-slate-500">
            Room: {userId ?? 'login first'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            disabled={!isAuthorized}
            onClick={onPing}
          >
            Ping socket
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={!isAuthorized}
            onClick={onSendTestNotification}
          >
            Send test notification
          </Button>
          <Button type="button" variant="secondary" onClick={onClear}>
            Clear list
          </Button>
        </div>

        {notifications.length === 0 ? (
          <EmptyState text="No notifications yet. Transfer balance or send a test notification." />
        ) : (
          <div className="space-y-3">
            {notifications.map((notification, index) => (
              <article
                key={`${notification.occurredAt}-${index}`}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-white">
                    {notification.type}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(notification.occurredAt).toLocaleString()}
                  </p>
                </div>
                <p className="mt-2 text-sm text-slate-300">
                  {notification.message}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
