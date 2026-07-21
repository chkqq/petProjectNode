import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Avatar } from '../../avatars/entities/avatar.entity';

@Entity('users')
@Index('idx_users_login_unique', ['login'], { unique: true })
@Index('idx_users_email_unique', ['email'], { unique: true })
@Index('idx_users_age', ['age'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 64 })
  login: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255, select: false })
  passwordHash: string;

  @Column({ type: 'int' })
  age: number;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  about: string | null;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: '0.00',
  })
  balance: string;

  @Column({
    name: 'refresh_token_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
    select: false,
  })
  refreshTokenHash: string | null;

  @Column({
    name: 'refresh_token_version',
    type: 'int',
    default: 0,
  })
  refreshTokenVersion: number;

  @OneToMany(() => Avatar, (avatar) => avatar.user)
  avatars?: Avatar[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
