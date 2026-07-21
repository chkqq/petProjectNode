import type {
  ActiveUser,
  AuthResponse,
  Avatar,
  BalanceResetResponse,
  LoginRequest,
  PaginatedUsersResponse,
  RegisterRequest,
  TransferBalanceRequest,
  TransferBalanceResponse,
  UpdateProfileRequest,
} from './types';
import type { User } from '../../entities/user/model/types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
const ACCESS_TOKEN_KEY = 'petProjectNode.accessToken';
const REFRESH_TOKEN_KEY = 'petProjectNode.refreshToken';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function saveTokens(response: AuthResponse): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

async function parseError(response: Response): Promise<string> {
  if (response.status === 429) {
    return 'Too many requests. Wait about a minute and try again.';
  }

  try {
    const data = (await response.json()) as {
      message?: string | string[];
      error?: string;
    };

    if (Array.isArray(data.message)) {
      return data.message.join(', ');
    }

    return data.message ?? data.error ?? `Request failed with ${response.status}`;
  } catch {
    return `Request failed with ${response.status}`;
  }
}

async function refreshTokens(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    clearTokens();
    return false;
  }

  saveTokens((await response.json()) as AuthResponse);
  return true;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers = new Headers(options.headers);
  const token = getAccessToken();
  const isFormData = options.body instanceof FormData;

  if (!headers.has('Content-Type') && options.body && !isFormData) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && retry && !path.startsWith('/auth/refresh')) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      return apiFetch<T>(path, options, false);
    }
  }

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  register: async (payload: RegisterRequest) => {
    const response = await apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    saveTokens(response);
    return response;
  },

  login: async (payload: LoginRequest) => {
    const response = await apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    saveTokens(response);
    return response;
  },

  logout: async () => {
    try {
      await apiFetch<{ message: string }>('/auth/logout', { method: 'POST' });
    } finally {
      clearTokens();
    }
  },

  me: () => apiFetch<User>('/profile/my'),

  users: (params: { page: number; limit: number; login?: string }) => {
    const search = new URLSearchParams({
      page: String(params.page),
      limit: String(params.limit),
    });

    if (params.login) {
      search.set('login', params.login);
    }

    return apiFetch<PaginatedUsersResponse>(`/profile?${search.toString()}`);
  },

  activeUsers: (params: { minAge: number; maxAge: number }) => {
    const search = new URLSearchParams({
      minAge: String(params.minAge),
      maxAge: String(params.maxAge),
    });

    return apiFetch<ActiveUser[]>(`/profile/active?${search.toString()}`);
  },

  updateMe: (payload: UpdateProfileRequest) =>
    apiFetch<User>('/profile/my', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  deleteMe: () => apiFetch<void>('/profile/my', { method: 'DELETE' }),

  avatars: () => apiFetch<Avatar[]>('/profile/my/avatars'),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiFetch<Avatar>('/profile/my/avatars', {
      method: 'POST',
      body: formData,
    });
  },

  deleteAvatar: (id: string) =>
    apiFetch<void>(`/profile/my/avatars/${id}`, { method: 'DELETE' }),

  transferBalance: (payload: TransferBalanceRequest) =>
    apiFetch<TransferBalanceResponse>('/balances/transfer', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  resetBalances: () =>
    apiFetch<BalanceResetResponse>('/balance-reset', {
      method: 'POST',
    }),
};
