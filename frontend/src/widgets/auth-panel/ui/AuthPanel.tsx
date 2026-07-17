import { type FormEvent, type ReactNode } from 'react';

import { passwordRules } from '../../../shared/lib/password';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { PasswordRules } from '../../../shared/ui/PasswordRules';
import { TextArea } from '../../../shared/ui/TextArea';
import { TextField } from '../../../shared/ui/TextField';
import type { AuthMode, UserFormState } from '../../../features/user-form/model/types';

interface AuthPanelProps {
  mode: AuthMode;
  form: UserFormState;
  loading: boolean;
  onModeChange: (mode: AuthMode) => void;
  onFieldChange: (field: keyof UserFormState, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function AuthPanel({
  mode,
  form,
  loading,
  onModeChange,
  onFieldChange,
  onSubmit,
}: AuthPanelProps) {
  return (
    <Card>
      <div className="mb-6 flex gap-2 rounded-2xl bg-slate-950/70 p-1">
        <TabButton active={mode === 'register'} onClick={() => onModeChange('register')}>
          Регистрация
        </TabButton>
        <TabButton active={mode === 'login'} onClick={() => onModeChange('login')}>
          Логин
        </TabButton>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <TextField
          label="Логин"
          value={form.login}
          onChange={(value) => onFieldChange('login', value)}
        />
        {mode === 'register' && (
          <>
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
            <TextArea
              label="О себе"
              value={form.about}
              onChange={(value) => onFieldChange('about', value)}
            />
          </>
        )}
        <TextField
          label="Пароль"
          type="password"
          value={form.password}
          onChange={(value) => onFieldChange('password', value)}
        />
        {mode === 'register' && <PasswordRules password={form.password} />}

        <Button type="submit" disabled={loading}>
          {mode === 'register' ? 'Создать пользователя' : 'Войти'}
        </Button>

        {mode === 'register' && (
          <p className="text-xs text-slate-400">
            Правила: {passwordRules.join(', ')}.
          </p>
        )}
      </form>
    </Card>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition ${
        active
          ? 'bg-emerald-400 text-slate-950'
          : 'text-slate-300 hover:bg-white/10'
      }`}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
