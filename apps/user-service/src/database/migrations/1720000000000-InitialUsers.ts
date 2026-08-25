import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialUsers1720000000000 implements MigrationInterface {
  name = 'InitialUsers1720000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "login" character varying(64) NOT NULL,
        "email" character varying(255) NOT NULL,
        "password_hash" character varying(255) NOT NULL,
        "age" integer NOT NULL,
        "about" character varying(1000),
        "refresh_token_hash" character varying(255),
        "refresh_token_version" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS "idx_users_login_unique" ON "users" ("login")',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS "idx_users_email_unique" ON "users" ("email")',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "idx_users_email_unique"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_users_login_unique"');
    await queryRunner.query('DROP TABLE IF EXISTS "users"');
  }
}
