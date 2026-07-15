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
  age?: number;
  about?: string | null;
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

export interface UsersRepositoryPort {
  create(command: CreateUserCommand): User;
  save(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByIdWithSecrets(id: string): Promise<User | null>;
  findByLogin(login: string): Promise<User | null>;
  findByLoginWithPassword(login: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(params: FindAllUsersParams): Promise<PaginatedUsers>;
  update(id: string, command: UpdateUserCommand): Promise<User | null>;
  updateRefreshTokenHash(
    id: string,
    refreshTokenHash: string | null,
  ): Promise<void>;
  softDelete(id: string): Promise<void>;
}
