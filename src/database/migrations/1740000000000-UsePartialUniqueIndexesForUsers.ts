import { MigrationInterface, QueryRunner } from 'typeorm';

export class UsePartialUniqueIndexesForUsers1740000000000
  implements MigrationInterface
{
  name = 'UsePartialUniqueIndexesForUsers1740000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "idx_users_login_unique"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_users_email_unique"');
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_users_login_unique_active"
      ON "users" ("login")
      WHERE "deleted_at" IS NULL
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_users_email_unique_active"
      ON "users" ("email")
      WHERE "deleted_at" IS NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS "idx_users_email_unique_active"',
    );
    await queryRunner.query(
      'DROP INDEX IF EXISTS "idx_users_login_unique_active"',
    );
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_users_login_unique"
      ON "users" ("login")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_users_email_unique"
      ON "users" ("email")
    `);
  }
}
