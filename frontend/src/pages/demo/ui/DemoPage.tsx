import { useEffect, useMemo, useState, type FormEvent } from 'react';

import type { User } from '../../../entities/user/model/types';
import type { AuthMode, UserFormState } from '../../../features/user-form/model/types';
import { api, clearTokens, getAccessToken, getRefreshToken } from '../../../shared/api/client';
import type { ActiveUser, Avatar } from '../../../shared/api/types';
import { assertStrongPassword } from '../../../shared/lib/password';
import { ActiveUsersPanel } from '../../../widgets/active-users-panel/ui/ActiveUsersPanel';
import { AuthPanel } from '../../../widgets/auth-panel/ui/AuthPanel';
import { AvatarsPanel } from '../../../widgets/avatars-panel/ui/AvatarsPanel';
import { BalancePanel } from '../../../widgets/balance-panel/ui/BalancePanel';
import { DemoHeader } from '../../../widgets/demo-header/ui/DemoHeader';
import { ProfilePanel } from '../../../widgets/profile-panel/ui/ProfilePanel';
import { UsersPanel } from '../../../widgets/users-panel/ui/UsersPanel';

const initialForm: UserFormState = {
  login: 'demo_user',
  email: 'demo@example.com',
  password: 'StrongPass123!',
  age: '23',
  about: 'I like NestJS, PostgreSQL and clear demos.',
};

export function DemoPage() {
  const [mode, setMode] = useState<AuthMode>('register');
  const [form, setForm] = useState<UserFormState>(initialForm);
  const [profileForm, setProfileForm] = useState<UserFormState>(initialForm);
  const [me, setMe] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loginFilter, setLoginFilter] = useState('');
  const [activeMinAge, setActiveMinAge] = useState('18');
  const [activeMaxAge, setActiveMaxAge] = useState('35');
  const [transferToUserId, setTransferToUserId] = useState('');
  const [transferAmount, setTransferAmount] = useState('1.00');
  const [status, setStatus] = useState('Ready to demo the API.');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isAuthorized = useMemo(() => Boolean(me && getAccessToken()), [me]);

  useEffect(() => {
    if (getAccessToken()) {
      void loadMe();
      void loadAvatars();
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
        caughtError instanceof Error ? caughtError.message : 'Something went wrong',
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadMe() {
    await runAction(async () => {
      const profile = await api.me();
      setMe(profile);
      setStatus(`Profile ${profile.login} loaded.`);
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
      setStatus(`Users loaded: ${response.meta.total}.`);
    });
  }

  async function loadAvatars() {
    await runAction(async () => {
      const response = await api.avatars();
      setAvatars(response);
      setStatus(`Avatars loaded: ${response.length}.`);
    });
  }

  async function loadActiveUsers() {
    await runAction(async () => {
      const response = await api.activeUsers({
        minAge: Number(activeMinAge),
        maxAge: Number(activeMaxAge),
      });
      setActiveUsers(response);
      setStatus(`Active users loaded: ${response.length}.`);
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
      setActiveUsers([]);
      await loadAvatars();
      setStatus(
        mode === 'register'
          ? 'Registration completed, tokens saved.'
          : 'Login completed, new token pair received.',
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
      setStatus('Profile updated through PATCH /profile/my.');
    });
  }

  async function handleLogout() {
    await runAction(async () => {
      await api.logout();
      setMe(null);
      setUsers([]);
      setAvatars([]);
      setActiveUsers([]);
      setStatus('Logged out, tokens removed from localStorage.');
    });
  }

  async function handleDeleteProfile() {
    const confirmed = window.confirm(
      'Delete current profile? Backend will perform soft-delete.',
    );

    if (!confirmed) {
      return;
    }

    await runAction(async () => {
      await api.deleteMe();
      clearTokens();
      setMe(null);
      setUsers([]);
      setAvatars([]);
      setActiveUsers([]);
      setStatus('Profile soft-deleted, local tokens cleared.');
    });
  }

  async function handleAvatarUpload(file: File) {
    await runAction(async () => {
      const avatar = await api.uploadAvatar(file);
      setAvatars((current) => [avatar, ...current]);
      setStatus(`Avatar ${avatar.originalName} uploaded.`);
    });
  }

  async function handleAvatarDelete(id: string) {
    await runAction(async () => {
      await api.deleteAvatar(id);
      setAvatars((current) => current.filter((avatar) => avatar.id !== id));
      setStatus('Avatar soft-deleted.');
    });
  }

  async function handleTransferBalance() {
    await runAction(async () => {
      const response = await api.transferBalance({
        toUserId: transferToUserId.trim(),
        amount: transferAmount.trim(),
      });
      setMe(response.from);
      setStatus(
        `Transfer $${response.amount} completed. New balance: $${response.from.balance}.`,
      );
    });
  }

  async function handleResetBalances() {
    await runAction(async () => {
      const response = await api.resetBalances();
      setStatus(`${response.message}. Job id: ${response.jobId}.`);
    });
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:py-12">
        <DemoHeader
          accessTokenStatus={getAccessToken() ? 'saved in localStorage' : 'empty'}
          refreshTokenStatus={getRefreshToken() ? 'saved and rotated' : 'empty'}
          securityStatus="rate limit + strong password + cache"
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

        <section className="grid gap-6 lg:grid-cols-2">
          <AvatarsPanel
            avatars={avatars}
            loading={loading}
            isAuthorized={isAuthorized}
            onUpload={handleAvatarUpload}
            onDelete={handleAvatarDelete}
            onReload={loadAvatars}
          />

          <BalancePanel
            me={me}
            toUserId={transferToUserId}
            amount={transferAmount}
            loading={loading}
            isAuthorized={isAuthorized}
            onToUserIdChange={setTransferToUserId}
            onAmountChange={setTransferAmount}
            onTransfer={handleTransferBalance}
            onResetBalances={handleResetBalances}
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

        <ActiveUsersPanel
          users={activeUsers}
          minAge={activeMinAge}
          maxAge={activeMaxAge}
          loading={loading}
          isAuthorized={isAuthorized}
          onMinAgeChange={setActiveMinAge}
          onMaxAgeChange={setActiveMaxAge}
          onLoad={loadActiveUsers}
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
