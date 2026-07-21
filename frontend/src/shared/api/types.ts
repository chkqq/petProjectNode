import type { User } from '../../entities/user/model/types';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterRequest {
  login: string;
  email: string;
  password: string;
  age: number;
  about?: string;
}

export interface LoginRequest {
  login: string;
  password: string;
}

export interface UpdateProfileRequest {
  login?: string;
  email?: string;
  password?: string;
  age?: number;
  about?: string;
}

export interface PaginatedUsersResponse {
  items: User[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Avatar {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
}

export interface ActiveUser {
  id: string;
  login: string;
  email: string;
  age: number;
  balance: string;
  about: string | null;
  activeAvatarsCount: number;
  latestAvatar: Avatar | null;
}

export interface TransferBalanceRequest {
  toUserId: string;
  amount: string;
}

export interface TransferBalanceResponse {
  amount: string;
  from: User;
  to: User;
}

export interface BalanceResetResponse {
  message: string;
  jobId: string;
}
