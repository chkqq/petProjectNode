import { useEffect, useMemo, useState, type FormEvent } from 'react';

import { api, clearTokens, getAccessToken, getRefreshToken } from '../../../shared/api/client';
import type { User } from '../../../entities/user/model/types';
import { assertStrongPassword } from '../../../shared/lib/password';
import { DemoHeader } from '../../../widgets/demo-header/ui/DemoHeader';
import { AuthPanel } from '../../../widgets/auth-panel/ui/AuthPanel';
import { ProfilePanel } from '../../../widgets/profile-panel/ui/ProfilePanel';
import { UsersPanel } from '../../../widgets/users-panel/ui/UsersPanel';
import type { AuthMode, UserFormState } from '../../../features/user-form/model/types';

const initialForm: UserFormState = {
  login: 'demo_user',
  email: 'demo@example.com',
  password: 'StrongPass123!',
  age: '23',
  about: 'Люблю NestJS, PostgreSQL и понятные демки.',
};

export function DemoPage() {
  const [mode, setMode] = useState<AuthMode>('register');
  const [form, setForm] = useState<UserFormState>(initialForm);
  const [profileForm, setProfileForm] = useState<UserFormState>(initialForm);
  const [me, setMe] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loginFilter, setLoginFilter] = useState('');
  const [status, setStatus] = useState('Готов к демонстрации API.');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isAuthorized = useMemo(() => Boolean(me && getAccessToken()), [me]);

  useEffect(() => {
    if (getAccessToken()) {
      void loadMe();
    }
  }, []);

  useEffect(() => {
    if (me) {
      setProfileForm({
        login: me.login,
        email: me.email,
        password: '',
        age: String(me.age),
        about: me.about ?? '',
      });
    }
  }, [me]);

  async function runAction(action: () => Promise<void>) {
    setLoading(true);
    setError('');

    try {
      await action();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Что-то пошло не так',
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadMe() {
    await runAction(async () => {
      const profile = await api.me();
      setMe(profile);
      setStatus(`Профиль ${profile.login} загружен.`);
    });
  }

  async function loadUsers(nextPage = page) {
    await runAction(async () => {
      const response = await api.users({
        page: nextPage,
        limit: 6,
        login: loginFilter.trim() || undefined,
      });
      setUsers(response.items);
      setPage(response.meta.page);
      setTotalPages(response.meta.totalPages);
      setStatus(`Пользователи загружены: ${response.meta.total}.`);
    });
  }

  function updateField(field: keyof UserFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateProfileField(field: keyof UserFormState, value: string) {
    setProfileForm((current) => ({ ...current, [field]: value }));
  }

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await runAction(async () => {
      if (mode === 'register') {
        assertStrongPassword(form.password);
      }

      const payload = {
        login: form.login.trim(),
        password: form.password,
      };

      const response =
        mode === 'register'
          ? await api.register({
              ...payload,
              email: form.email.trim(),
              age: Number(form.age),
              about: form.about.trim() || undefined,
            })
          : await api.login(payload);

      setMe(response.user);
      setUsers([]);
      setStatus(
        mode === 'register'
          ? 'Регистрация прошла успешно, токены сохранены.'
          : 'Логин успешный, получена новая пара токенов.',
      );
    });
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await runAction(async () => {
      if (profileForm.password) {
        assertStrongPassword(profileForm.password);
      }

      const payload = {
        login: profileForm.login.trim(),
        email: profileForm.email.trim(),
        age: Number(profileForm.age),
        about: profileForm.about.trim(),
        ...(profileForm.password ? { password: profileForm.password } : {}),
      };

      const updatedProfile = await api.updateMe(payload);
      setMe(updatedProfile);
      setStatus('Профиль обновлён через PATCH /profile/my.');
    });
  }

  async function handleLogout() {
    await runAction(async () => {
      await api.logout();
      setMe(null);
      setUsers([]);
      setStatus('Вы вышли из системы, токены удалены из localStorage.');
    });
  }

  async function handleDeleteProfile() {
    const confirmed = window.confirm(
      'Удалить текущий профиль? На backend будет soft-delete.',
    );

    if (!confirmed) {
      return;
    }

    await runAction(async () => {
      await api.deleteMe();
      clearTokens();
      setMe(null);
      setUsers([]);
      setStatus('Профиль мягко удалён, локальные токены очищены.');
    });
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:py-12">
        <DemoHeader
          accessTokenStatus={getAccessToken() ? 'сохранён в localStorage' : 'нет'}
          refreshTokenStatus={getRefreshToken() ? 'сохранён и ротируется' : 'нет'}
          securityStatus="rate limit + strong password"
        />

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <AuthPanel
            mode={mode}
            form={form}
            loading={loading}
            onModeChange={setMode}
            onFieldChange={updateField}
            onSubmit={handleAuthSubmit}
          />

          <ProfilePanel
            me={me}
            form={profileForm}
            loading={loading}
            isAuthorized={isAuthorized}
            onFieldChange={updateProfileField}
            onSubmit={handleProfileSubmit}
            onReload={loadMe}
            onLogout={handleLogout}
            onDelete={handleDeleteProfile}
          />
        </section>

        <UsersPanel
          users={users}
          page={page}
          totalPages={totalPages}
          loginFilter={loginFilter}
          loading={loading}
          isAuthorized={isAuthorized}
          onLoginFilterChange={setLoginFilter}
          onLoadUsers={loadUsers}
        />

        {(status || error) && (
          <div className="sticky bottom-4 rounded-2xl border border-white/10 bg-slate-900/95 p-4 shadow-soft backdrop-blur">
            {status && <p className="text-sm text-emerald-200">{status}</p>}
            {error && <p className="mt-1 text-sm text-rose-300">{error}</p>}
          </div>
        )}
      </section>
    </main>
  );
}
