import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAvatarsAndBalances1730000000000
  implements MigrationInterface
{
  name = 'AddAvatarsAndBalances1730000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "refresh_token_version" integer NOT NULL DEFAULT 0
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "balance" numeric(12,2) NOT NULL DEFAULT 0.00
    `);
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "idx_users_age" ON "users" ("age")',
    );
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "avatars" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "file_name" character varying(255) NOT NULL,
        "original_name" character varying(255) NOT NULL,
        "mime_type" character varying(64) NOT NULL,
        "size" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_avatars_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_avatars_user_id" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "idx_avatars_user_active" ON "avatars" ("user_id", "deleted_at")',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "idx_avatars_user_created_at" ON "avatars" ("user_id", "created_at")',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS "idx_avatars_user_created_at"',
    );
    await queryRunner.query('DROP INDEX IF EXISTS "idx_avatars_user_active"');
    await queryRunner.query('DROP TABLE IF EXISTS "avatars"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_users_age"');
    await queryRunner.query('ALTER TABLE "users" DROP COLUMN IF EXISTS "balance"');
  }
}
