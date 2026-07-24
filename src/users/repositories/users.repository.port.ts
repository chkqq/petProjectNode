import { User } from '../entities/user.entity';

export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');

export interface CreateUserCommand {
  login: string;
  email: string;
  passwordHash: string;
  age: number;
  about?: string;
}

export interface UpdateUserCommand {
  login?: string;
  email?: string;
  passwordHash?: string;
  refreshTokenHash?: string | null;
  age?: number;
  about?: string | null;
}

export interface FindActiveUsersParams {
  minAge: number;
  maxAge: number;
}

export interface FindAllUsersParams {
  page: number;
  limit: number;
  login?: string;
}

export interface PaginatedUsers {
  items: User[];
  total: number;
  page: number;
  limit: number;
}

export interface LatestAvatarProjection {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: Date;
}

export interface ActiveUserProjection {
  id: string;
  login: string;
  email: string;
  age: number;
  about: string | null;
  balance: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  activeAvatarsCount: number;
  latestAvatar: LatestAvatarProjection | null;
}

export interface UsersRepositoryPort {
  create(command: CreateUserCommand): User;
  save(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByIdWithSecrets(id: string): Promise<User | null>;
  findByLogin(login: string): Promise<User | null>;
  findByLoginWithPassword(login: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(params: FindAllUsersParams): Promise<PaginatedUsers>;
  findActiveUsers(params: FindActiveUsersParams): Promise<ActiveUserProjection[]>;
  findByIdForUpdate(id: string): Promise<User | null>;
  update(id: string, command: UpdateUserCommand): Promise<User | null>;
  updateBalance(id: string, balance: string): Promise<void>;
  resetAllBalances(): Promise<number>;
  updateRefreshTokenHash(
    id: string,
    refreshTokenHash: string | null,
  ): Promise<void>;
  updateRefreshTokenState(
    id: string,
    refreshTokenHash: string,
    refreshTokenVersion: number,
  ): Promise<void>;
  softDelete(id: string): Promise<void>;
}
