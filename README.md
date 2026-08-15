# Pet Project Node API

NestJS monorepo with user-service, notification-service, JWT auth, PostgreSQL, MinIO avatars, Redis cache, Bull jobs, Kafka, Socket.io and MongoDB notification history.

## Stack

- NestJS
- PostgreSQL
- TypeORM
- typeorm-transactional
- Passport + JWT
- MinIO + S3 SDK
- Redis
- Bull
- Kafka
- Socket.io
- MongoDB + Mongoose
- ESLint + Husky + lint-staged
- React + TypeScript + Tailwind demo frontend

## Monorepo projects

- `apps/user-service` - HTTP REST API from homework 1 and 2.
- `apps/notification-service` - WebSocket + Kafka consumer + MongoDB notification storage.
- `libs/common` - shared filter, money utils and Kafka event contracts.

## Quick start

```bash
cp .env.example .env
npm install
npm run frontend:install
npm run db:up
npm run migration:run
npm run start:dev:user-service
```

Notification service:

```bash
npm run start:dev:notification-service
```

Frontend:

```bash
npm run frontend:dev
```

URLs:

- API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/docs`
- Notification HTTP + WebSocket: `http://localhost:3001`
- Frontend: `http://localhost:5173`
- MinIO console: `http://localhost:9001`
- Kafka UI: `http://localhost:8080`

MinIO dev credentials:

- login: `minioadmin`
- password: `minioadmin`

## Scripts

```bash
npm run db:up
npm run db:down
npm run db:logs
npm run migration:run
npm run migration:revert
npm run lint
npm run lint:fix
npm run lint:watch
npm run build
npm run build:user-service
npm run build:notification-service
npm run start:dev:user-service
npm run start:dev:notification-service
npm test
npm run test:e2e
npm run frontend:build
```

## Main routes

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

Profiles:

- `GET /api/profile/my`
- `PATCH /api/profile/my`
- `DELETE /api/profile/my`
- `GET /api/profile?page=1&limit=10&login=ram`
- `GET /api/profile/active?minAge=18&maxAge=35`
- `GET /api/profile/:id`

Avatars:

- `POST /api/profile/my/avatars`
- `GET /api/profile/my/avatars`
- `DELETE /api/profile/my/avatars/:id`

Balances:

- `POST /api/balances/transfer`
- `POST /api/balance-reset`

Notification service:

- `POST /notifications/send`
- Socket.io event from client: `ping`
- Socket.io event from server: `notification`

Kafka:

- topic: `balance.transferred`

## Notes

- Password must contain at least 8 characters, one lowercase letter, one uppercase letter, one number and one special character.
- Avatars must be JPEG or PNG and less than 10 MB.
- A user can have up to 5 active avatars.
- Soft-deleted users free up their login and email for new registration.
- Changing password revokes the current refresh session.
- `GET /profile` and `GET /profile/:id` are cached in Redis for 30 seconds.
- Balance transfer uses a DB transaction.
- Successful balance transfer publishes Kafka event after transaction commit.
- Notification Service consumes Kafka events, sends Socket.io notifications to both users and stores records in MongoDB.
- Balance reset is queued through Bull and also scheduled every 10 minutes.
- Services access the database through repository ports.

## Docs

- `docs/homework-3-monorepo-notifications.md`
- `docs/homework-3-detailed-ru.md`
- `docs/homework-3-study-questions.md`
