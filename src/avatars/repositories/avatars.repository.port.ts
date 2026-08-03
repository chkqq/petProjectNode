import { Avatar } from '../entities/avatar.entity';

export const AVATARS_REPOSITORY = Symbol('AVATARS_REPOSITORY');

export interface CreateAvatarCommand {
  userId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface AvatarsRepositoryPort {
  create(command: CreateAvatarCommand): Avatar;
  save(avatar: Avatar): Promise<Avatar>;
  countActiveByUserId(userId: string): Promise<number>;
  findActiveByUserId(userId: string): Promise<Avatar[]>;
  findActiveByIdAndUserId(id: string, userId: string): Promise<Avatar | null>;
  softDelete(id: string): Promise<void>;
}
