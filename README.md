# Pet Project Node API

REST API на NestJS для CRUD-профилей пользователей, регистрации, логина и JWT refresh/access токенов.

## Стек

- NestJS
- PostgreSQL в Docker Compose
- TypeORM
- Passport + JWT
- class-validator
- Helmet
- Rate limiting
- Swagger
- Jest

## Быстрый запуск

```bash
cp .env.example .env
docker compose up -d
npm install
npm run migration:run
npm run start:dev
```

API по умолчанию доступен на `http://localhost:3000/api`.

Swagger: `http://localhost:3000/docs`.

Подробный учебный разбор backend-кода: [`docs/backend-explanation.md`](docs/backend-explanation.md).

## Скрипты

```bash
npm run db:up
npm run db:down
npm run db:logs
npm run migration:run
npm run migration:revert
npm run test:e2e
npm run build
npm run start:dev
npm test
```

## Основные роуты

- `POST /api/auth/register` — регистрация, возвращает `accessToken` и `refreshToken`
- `POST /api/auth/login` — вход по `login` + `password`, возвращает новую пару токенов
- `POST /api/auth/refresh` — обновление пары токенов по refresh-токену
- `POST /api/auth/logout` — удаление refresh-токена текущего пользователя
- `GET /api/profile/my` — профиль текущего пользователя без `:id`
- `GET /api/profile?page=1&limit=10&login=ram` — список пользователей с пагинацией и поиском по логину
- `GET /api/profile/:id` — профиль пользователя по id
- `PATCH /api/profile/my` — обновление текущего профиля
- `DELETE /api/profile/my` — мягкое удаление текущего профиля

Пароль должен содержать минимум 8 символов, включая:

- строчную букву;
- заглавную букву;
- цифру;
- спецсимвол.

Защищённые роуты требуют заголовок:

```http
Authorization: Bearer <accessToken>
```

Если access-токен истёк, защищённые роуты возвращают `401`; новую пару токенов нужно получить через `/api/auth/refresh`.

## Repository pattern

Сервисы не обращаются напрямую к TypeORM `Repository`. Все обращения к БД проходят через `UsersRepositoryPort`, реализованный классом `TypeOrmUsersRepository`.

## Миграции

Сейчас проект использует миграции TypeORM.

Основные команды:

```bash
npm run migration:run
npm run migration:revert
npm run migration:generate -- NameOfMigration
```

Для e2e-тестов нужна запущенная PostgreSQL через Docker Compose.
