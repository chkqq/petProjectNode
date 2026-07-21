type RawEnv = Record<string, unknown>;

const DEFAULT_ACCESS_SECRET = 'local_access_secret_change_me_32_chars';
const DEFAULT_REFRESH_SECRET = 'local_refresh_secret_change_me_32_chars';

function asString(config: RawEnv, key: string, defaultValue: string): string {
  const value = config[key];
  return typeof value === 'string' && value.trim() !== '' ? value : defaultValue;
}

function asInteger(config: RawEnv, key: string, defaultValue: number): number {
  const value = config[key];
  const parsed =
    typeof value === 'number'
      ? value
      : Number.parseInt(typeof value === 'string' ? value : '', 10);

  if (Number.isInteger(parsed) && parsed > 0) {
    return parsed;
  }

  return defaultValue;
}

function asBoolean(config: RawEnv, key: string, defaultValue: boolean): boolean {
  const value = config[key];

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value !== 'string') {
    return defaultValue;
  }

  if (['true', '1', 'yes'].includes(value.toLowerCase())) {
    return true;
  }

  if (['false', '0', 'no'].includes(value.toLowerCase())) {
    return false;
  }

  return defaultValue;
}

export function validateEnv(config: RawEnv): RawEnv {
  return {
    ...config,
    PORT: asInteger(config, 'PORT', 3000),
    API_PREFIX: asString(config, 'API_PREFIX', 'api'),
    DB_HOST: asString(config, 'DB_HOST', 'localhost'),
    DB_PORT: asInteger(config, 'DB_PORT', 5432),
    DB_USERNAME: asString(config, 'DB_USERNAME', 'pet_user'),
    DB_PASSWORD: asString(config, 'DB_PASSWORD', 'pet_password'),
    DB_NAME: asString(config, 'DB_NAME', 'pet_project_node'),
    DB_SYNCHRONIZE: asBoolean(config, 'DB_SYNCHRONIZE', true),
    DB_MIGRATIONS_RUN: asBoolean(config, 'DB_MIGRATIONS_RUN', false),
    JWT_ACCESS_SECRET: asString(
      config,
      'JWT_ACCESS_SECRET',
      DEFAULT_ACCESS_SECRET,
    ),
    JWT_REFRESH_SECRET: asString(
      config,
      'JWT_REFRESH_SECRET',
      DEFAULT_REFRESH_SECRET,
    ),
    JWT_ACCESS_TTL: asString(config, 'JWT_ACCESS_TTL', '15m'),
    JWT_REFRESH_TTL: asString(config, 'JWT_REFRESH_TTL', '7d'),
    BCRYPT_SALT_ROUNDS: asInteger(config, 'BCRYPT_SALT_ROUNDS', 10),
    MINIO_ENDPOINT: asString(config, 'MINIO_ENDPOINT', 'http://localhost:9000'),
    MINIO_PUBLIC_URL: asString(
      config,
      'MINIO_PUBLIC_URL',
      'http://localhost:9000',
    ),
    MINIO_REGION: asString(config, 'MINIO_REGION', 'us-east-1'),
    MINIO_ACCESS_KEY: asString(config, 'MINIO_ACCESS_KEY', 'minioadmin'),
    MINIO_SECRET_KEY: asString(config, 'MINIO_SECRET_KEY', 'minioadmin'),
    MINIO_BUCKET: asString(config, 'MINIO_BUCKET', 'avatars'),
    REDIS_HOST: asString(config, 'REDIS_HOST', 'localhost'),
    REDIS_PORT: asInteger(config, 'REDIS_PORT', 6379),
    REDIS_PASSWORD: asString(config, 'REDIS_PASSWORD', ''),
    REDIS_CACHE_TTL_SECONDS: asInteger(
      config,
      'REDIS_CACHE_TTL_SECONDS',
      30,
    ),
    BALANCE_RESET_REPEAT_MS: asInteger(
      config,
      'BALANCE_RESET_REPEAT_MS',
      600000,
    ),
  };
}
