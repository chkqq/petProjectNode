import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Test } from '@nestjs/testing';
import { Client } from 'pg';
import * as request from 'supertest';
import { DataSource } from 'typeorm';

import { setupApp } from '../src/app.setup';

const TEST_RUN_ID = randomUUID().replace(/-/g, '').slice(0, 8);
const TEST_DB_NAME = `pet_project_node_e2e_${TEST_RUN_ID}`;
const TEST_LOGIN = `e2e_user_${TEST_RUN_ID}`;
const TEST_EMAIL = `e2e_${TEST_RUN_ID}@example.com`;
const STRONG_PASSWORD = 'StrongPass123!';

async function recreateTestDatabase(): Promise<void> {
  const databaseName = TEST_DB_NAME;
  if (!/^[a-zA-Z0-9_]+$/.test(databaseName)) {
    throw new Error(`Unsafe database name: ${databaseName}`);
  }

  const client = new Client({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5433),
    user: process.env.DB_USERNAME ?? 'pet_user',
    password: process.env.DB_PASSWORD ?? 'pet_password',
    database: 'postgres',
  });

  await client.connect();
  await client.query(
    'SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1',
    [databaseName],
  );
  await client.query(`DROP DATABASE IF EXISTS "${databaseName}"`);
  await client.query(`CREATE DATABASE "${databaseName}"`);
  await client.end();
}

describe('API e2e', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    process.env.DB_HOST = process.env.DB_HOST ?? 'localhost';
    process.env.DB_PORT = process.env.DB_PORT ?? '5433';
    process.env.DB_USERNAME = process.env.DB_USERNAME ?? 'pet_user';
    process.env.DB_PASSWORD = process.env.DB_PASSWORD ?? 'pet_password';
    process.env.DB_NAME = TEST_DB_NAME;
    process.env.DB_SYNCHRONIZE = 'false';
    process.env.DB_MIGRATIONS_RUN = 'true';
    process.env.JWT_ACCESS_SECRET = 'test_access_secret_at_least_32_chars';
    process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_at_least_32_chars';
    process.env.JWT_ACCESS_TTL = '15m';
    process.env.JWT_REFRESH_TTL = '7d';
    process.env.BCRYPT_SALT_ROUNDS = '4';

    await recreateTestDatabase();
    const { AppModule } = await import('../src/app.module');

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app?.close();

    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('runs full auth/profile flow', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        login: TEST_LOGIN,
        email: TEST_EMAIL,
        password: STRONG_PASSWORD,
        age: 25,
        about: 'E2E user',
      })
      .expect(201);

    expect(registerResponse.body).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      user: {
        login: TEST_LOGIN,
        email: TEST_EMAIL,
      },
    });
    expect(registerResponse.body.user).not.toHaveProperty('passwordHash');

    await request(app.getHttpServer())
      .get('/api/profile/my')
      .expect(401);

    await request(app.getHttpServer())
      .get('/api/profile/my')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    const profileResponse = await request(app.getHttpServer())
      .get('/api/profile/my')
      .set('Authorization', `Bearer ${registerResponse.body.accessToken}`)
      .expect(200);

    expect(profileResponse.body).toMatchObject({
      id: registerResponse.body.user.id,
      login: TEST_LOGIN,
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ login: TEST_LOGIN, password: STRONG_PASSWORD })
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ login: TEST_LOGIN, password: 'WrongPass123!' })
      .expect(401);

    const firstRefreshToken = loginResponse.body.refreshToken;
    const refreshResponse = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: firstRefreshToken })
      .expect(200);

    expect(refreshResponse.body.refreshToken).not.toBe(firstRefreshToken);

    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: firstRefreshToken })
      .expect(401);

    const usersResponse = await request(app.getHttpServer())
      .get(`/api/profile?page=1&limit=10&login=${TEST_LOGIN}`)
      .set('Authorization', `Bearer ${refreshResponse.body.accessToken}`)
      .expect(200);

    expect(usersResponse.body.items).toHaveLength(1);
    expect(usersResponse.body.meta).toMatchObject({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });

    await request(app.getHttpServer())
      .patch('/api/profile/my')
      .set('Authorization', `Bearer ${refreshResponse.body.accessToken}`)
      .send({ about: 'Updated from e2e' })
      .expect(200);

    await request(app.getHttpServer())
      .delete('/api/profile/my')
      .set('Authorization', `Bearer ${refreshResponse.body.accessToken}`)
      .expect(204);

    await request(app.getHttpServer())
      .get('/api/profile/my')
      .set('Authorization', `Bearer ${refreshResponse.body.accessToken}`)
      .expect(401);
  });
});
