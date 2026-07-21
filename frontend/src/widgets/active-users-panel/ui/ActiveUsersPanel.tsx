import type { ActiveUser } from '../../../shared/api/types';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { TextField } from '../../../shared/ui/TextField';

interface ActiveUsersPanelProps {
  users: ActiveUser[];
  minAge: string;
  maxAge: string;
  loading: boolean;
  isAuthorized: boolean;
  onMinAgeChange: (value: string) => void;
  onMaxAgeChange: (value: string) => void;
  onLoad: () => void;
}

export function ActiveUsersPanel({
  users,
  minAge,
  maxAge,
  loading,
  isAuthorized,
  onMinAgeChange,
  onMaxAgeChange,
  onLoad,
}: ActiveUsersPanelProps) {
  return (
    <Card>
      <h2 className="text-2xl font-bold">Most active users</h2>
      <p className="mt-2 text-sm text-slate-400">
        Conditions: more than 2 active avatars, non-empty about and age in range.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <TextField label="Age from" type="number" value={minAge} onChange={onMinAgeChange} />
        <TextField label="Age to" type="number" value={maxAge} onChange={onMaxAgeChange} />
      </div>

      <div className="mt-4">
        <Button disabled={loading || !isAuthorized} onClick={onLoad}>
          Load active users
        </Button>
      </div>

      {users.length > 0 ? (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {users.map((user) => (
            <article
              key={user.id}
              className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"
            >
              <div className="flex gap-4">
                {user.latestAvatar ? (
                  <img
                    alt={user.latestAvatar.originalName}
                    className="h-16 w-16 rounded-2xl object-cover"
                    src={user.latestAvatar.url}
                  />
                ) : (
                  <div className="h-16 w-16 rounded-2xl bg-white/10" />
                )}
                <div>
                  <h3 className="font-bold text-white">@{user.login}</h3>
                  <p className="text-sm text-slate-400">
                    {user.activeAvatarsCount} active avatars
                  </p>
                  <p className="text-sm text-emerald-200">${user.balance}</p>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-slate-300">
                {user.about}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState text="No active users loaded yet." />
      )}
    </Card>
  );
}
