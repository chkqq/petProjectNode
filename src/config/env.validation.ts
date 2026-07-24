type RawEnv = Record<string, unknown>;

//  БЛОКЕР
// Самое опасное место во всей домашке.
// Если JWT_ACCESS_SECRET не задан в окружении, validateEnv молча подставит
// вот этот литерал. А он лежит в публичном репозитории. Дальше любой, кто
// открывал код, подписывает себе токен с чужим sub и ходит от чужого имени:
// JwtStrategy.validate проверяет только то, что пользователь существует
//
// Ты пытался прикрыться getOrThrow (auth.service.ts:118 и jwt.strategy.ts:19),
// но здесь он бесполезен к моменту вызова значение уже подставлено, бросать
// нечего. Приложение не упадёт, молча уйдёт на дефолт
//
// Заведи required(config, key), который кидает Error на пустом значении, и
// прогони через него оба секрета. Эти две константы удали — в .env.example
// плейсхолдеры уже есть, локальный запуск не сломается
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
  };
}
