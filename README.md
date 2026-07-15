# Pet Project Node API

REST API на NestJS для CRUD-профилей пользователей, регистрации, логина и JWT refresh/access токенов.

Дополнительно в папке `frontend/` лежит простой demo-клиент на React + TypeScript + Tailwind, чтобы можно было показать работу API через интерфейс.

## Стек

- NestJS
- PostgreSQL в Docker Compose
- TypeORM
- Passport + JWT
- class-validator
- Swagger
- Jest
- React + TypeScript + Tailwind для demo-frontend

## Быстрый запуск

```bash
cp .env.example .env
docker compose up -d
npm install
npm run start:dev
```

API по умолчанию доступен на `http://localhost:3000/api`.

Swagger: `http://localhost:3000/docs`.

Подробный учебный разбор backend-кода: [`docs/backend-explanation.md`](docs/backend-explanation.md).

Frontend запускается отдельно:

```bash
npm run frontend:install
npm run frontend:dev
```

Demo UI: `http://localhost:5173`.

Если backend запущен не на `http://localhost:3000/api`, создай `frontend/.env` по примеру `frontend/.env.example` и поменяй `VITE_API_URL`.

## Скрипты

```bash
npm run build
npm run start:dev
npm test
npm run frontend:build
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

Защищённые роуты требуют заголовок:

```http
Authorization: Bearer <accessToken>
```

Если access-токен истёк, защищённые роуты возвращают `401`; новую пару токенов нужно получить через `/api/auth/refresh`.

## Repository pattern

Сервисы не обращаются напрямую к TypeORM `Repository`. Все обращения к БД проходят через `UsersRepositoryPort`, реализованный классом `TypeOrmUsersRepository`.
