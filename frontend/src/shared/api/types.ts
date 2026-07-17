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
