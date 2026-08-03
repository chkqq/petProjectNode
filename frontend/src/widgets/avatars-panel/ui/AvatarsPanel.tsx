import type { ChangeEvent } from 'react';

import type { Avatar } from '../../../shared/api/types';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { EmptyState } from '../../../shared/ui/EmptyState';

interface AvatarsPanelProps {
  avatars: Avatar[];
  loading: boolean;
  isAuthorized: boolean;
  onUpload: (file: File) => void;
  onDelete: (id: string) => void;
  onReload: () => void;
}

export function AvatarsPanel({
  avatars,
  loading,
  isAuthorized,
  onUpload,
  onDelete,
  onReload,
}: AvatarsPanelProps) {
  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
      event.target.value = '';
    }
  }

  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Avatars</h2>
          <p className="mt-2 text-sm text-slate-400">
            JPEG/PNG up to 10 MB. A user can have up to 5 active avatars.
          </p>
        </div>
        <Button variant="secondary" disabled={loading || !isAuthorized} onClick={onReload}>
          Reload
        </Button>
      </div>

      <label className="mt-6 block rounded-2xl border border-dashed border-emerald-300/40 bg-emerald-400/5 p-5 text-sm text-slate-300">
        <span className="font-bold text-emerald-200">Upload avatar</span>
        <input
          className="mt-3 block w-full text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-emerald-400 file:px-4 file:py-2 file:font-bold file:text-slate-950"
          type="file"
          accept="image/png,image/jpeg"
          disabled={loading || !isAuthorized || avatars.length >= 5}
          onChange={handleFileChange}
        />
      </label>

      {avatars.length > 0 ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {avatars.map((avatar) => (
            <article
              key={avatar.id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50"
            >
              <img
                alt={avatar.originalName}
                className="h-40 w-full object-cover"
                src={avatar.url}
              />
              <div className="space-y-3 p-4">
                <p className="truncate text-sm font-bold text-white">
                  {avatar.originalName}
                </p>
                <p className="text-xs text-slate-400">
                  {(avatar.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <Button
                  variant="danger"
                  disabled={loading}
                  onClick={() => onDelete(avatar.id)}
                >
                  Soft-delete
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState text="No active avatars yet." />
      )}
    </Card>
  );
}
