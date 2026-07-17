import { type FormEvent } from 'react';

import type { User } from '../../../entities/user/model/types';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { PasswordRules } from '../../../shared/ui/PasswordRules';
import { TextArea } from '../../../shared/ui/TextArea';
import { TextField } from '../../../shared/ui/TextField';
import type { UserFormState } from '../../../features/user-form/model/types';

interface ProfilePanelProps {
  me: User | null;
  form: UserFormState;
  loading: boolean;
  isAuthorized: boolean;
  onFieldChange: (field: keyof UserFormState, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReload: () => void;
  onLogout: () => void;
  onDelete: () => void;
}

export function ProfilePanel({
  me,
  form,
  loading,
  isAuthorized,
  onFieldChange,
  onSubmit,
  onReload,
  onLogout,
  onDelete,
}: ProfilePanelProps) {
  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Профиль</h2>
          <p className="mt-2 text-sm text-slate-400">
            Работает через <code>GET/PATCH/DELETE /profile/my</code>.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onReload} disabled={loading}>
            Обновить
          </Button>
          <Button variant="danger" onClick={onLogout} disabled={loading || !isAuthorized}>
            Logout
          </Button>
        </div>
      </div>

      {me ? (
        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <TextField
            label="Логин"
            value={form.login}
            onChange={(value) => onFieldChange('login', value)}
          />
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={(value) => onFieldChange('email', value)}
          />
          <TextField
            label="Возраст"
            type="number"
            value={form.age}
            onChange={(value) => onFieldChange('age', value)}
          />
          <TextField
            label="Новый пароль"
            type="password"
            placeholder="StrongPass123! или оставь пустым"
            value={form.password}
            onChange={(value) => onFieldChange('password', value)}
          />
          {form.password && (
            <div className="md:col-span-2">
              <PasswordRules password={form.password} />
            </div>
          )}
          <div className="md:col-span-2">
            <TextArea
              label="О себе"
              value={form.about}
              onChange={(value) => onFieldChange('about', value)}
            />
          </div>
          <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row">
            <Button type="submit" disabled={loading}>
              Сохранить изменения
            </Button>
            <Button type="button" variant="danger" onClick={onDelete} disabled={loading}>
              Soft-delete профиль
            </Button>
          </div>
        </form>
      ) : (
        <EmptyState text="Сначала зарегистрируйся или войди, и тут появится профиль." />
      )}
    </Card>
  );
}
