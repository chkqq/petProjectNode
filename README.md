# Pet Project Node API

NestJS REST API for user profiles, JWT auth, PostgreSQL, MinIO avatars, Redis cache, Bull jobs and balance transfers.

## Stack

- NestJS
- PostgreSQL
- TypeORM
- typeorm-transactional
- Passport + JWT
- MinIO + S3 SDK
- Redis
- Bull
- ESLint + Husky + lint-staged
- React + TypeScript + Tailwind demo frontend

## Quick start

```bash
cp .env.example .env
npm install
npm run frontend:install
npm run db:up
npm run migration:run
npm run start:dev
```

Frontend:

```bash
npm run frontend:dev
```

URLs:

- API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/docs`
- Frontend: `http://localhost:5173`
- MinIO console: `http://localhost:9001`

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

## Notes

- Password must contain at least 8 characters, one lowercase letter, one uppercase letter, one number and one special character.
- Avatars must be JPEG or PNG and less than 10 MB.
- A user can have up to 5 active avatars.
- `GET /profile` and `GET /profile/:id` are cached in Redis for 30 seconds.
- Balance transfer uses a DB transaction.
- Balance reset is queued through Bull and also scheduled every 10 minutes.
- Services access the database through repository ports.

## Docs

- `docs/mvp-2-backend-guide.md`
- `docs/mvp-2-code-walkthrough.md`
- `docs/mvp-2-questions.md`
