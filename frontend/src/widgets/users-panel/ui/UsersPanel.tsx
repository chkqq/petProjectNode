import type { User } from '../../../entities/user/model/types';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { TextField } from '../../../shared/ui/TextField';

interface UsersPanelProps {
  users: User[];
  page: number;
  totalPages: number;
  loginFilter: string;
  loading: boolean;
  isAuthorized: boolean;
  onLoginFilterChange: (value: string) => void;
  onLoadUsers: (page: number) => void;
}

export function UsersPanel({
  users,
  page,
  totalPages,
  loginFilter,
  loading,
  isAuthorized,
  onLoginFilterChange,
  onLoadUsers,
}: UsersPanelProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
      <Card>
        <h2 className="text-2xl font-bold">Users list</h2>
        <p className="mt-2 text-sm text-slate-400">
          Protected endpoint with pagination, login filter and Redis cache.
        </p>
        <div className="mt-6 space-y-4">
          <TextField
            label="Search by login"
            placeholder="demo"
            value={loginFilter}
            onChange={onLoginFilterChange}
          />
          <Button disabled={loading || !isAuthorized} onClick={() => onLoadUsers(1)}>
            Load users
          </Button>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={loading || page <= 1}
              onClick={() => onLoadUsers(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              disabled={loading || page >= totalPages}
              onClick={() => onLoadUsers(page + 1)}
            >
              Next
            </Button>
          </div>
          <p className="text-sm text-slate-400">
            Page {page} of {totalPages}
          </p>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Users</h2>
          <span className="rounded-full bg-sky-400/10 px-3 py-1 text-sm text-sky-200 ring-1 ring-sky-400/20">
            {users.length} shown
          </span>
        </div>

        {users.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {users.map((user) => (
              <article
                key={user.id}
                className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white">@{user.login}</h3>
                    <p className="text-sm text-slate-400">{user.email}</p>
                    <p className="text-sm text-emerald-200">${user.balance}</p>
                  </div>
                  <span className="rounded-full bg-violet-400/10 px-3 py-1 text-sm text-violet-200">
                    {user.age}
                  </span>
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">
                  {user.about || 'No description.'}
                </p>
                <p className="mt-3 break-all text-xs text-slate-500">{user.id}</p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState text="Click Load users after login." />
        )}
      </Card>
    </section>
  );
}
