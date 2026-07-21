import { config as loadEnv } from 'dotenv';
import { DataSource } from 'typeorm';

import { Avatar } from '../avatars/entities/avatar.entity';
import { validateEnv } from '../config/env.validation';
import { User } from '../users/entities/user.entity';
import { AddAvatarsAndBalances1730000000000 } from './migrations/1730000000000-AddAvatarsAndBalances';
import { InitialUsers1720000000000 } from './migrations/1720000000000-InitialUsers';

loadEnv();

const env = validateEnv(process.env);

export default new DataSource({
  type: 'postgres',
  host: env.DB_HOST as string,
  port: env.DB_PORT as number,
  username: env.DB_USERNAME as string,
  password: env.DB_PASSWORD as string,
  database: env.DB_NAME as string,
  entities: [User, Avatar],
  migrations: [
    InitialUsers1720000000000,
    AddAvatarsAndBalances1730000000000,
  ],
  synchronize: false,
});
