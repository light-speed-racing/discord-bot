import { MigrationInterface, QueryRunner } from 'typeorm';

export class makeTrackOptional1681470759636 implements MigrationInterface {
  name = 'makeTrackOptional1681470759636';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "hotlaps"
            ALTER COLUMN "track" DROP NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "hotlaps"
            ALTER COLUMN "track"
            SET NOT NULL
        `);
  }
}
