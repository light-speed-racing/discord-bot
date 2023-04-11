import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUrlsToHotlapTable1680674912404 implements MigrationInterface {
  name = 'addUrlsToHotlapTable1680674912404';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "hotlaps"
            ADD "entrylistUrl" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "hotlaps"
            ADD "openGamePanelData" jsonb
        `);
    await queryRunner.query(`
            ALTER TABLE "hotlaps"
            ADD "deletedAt" TIMESTAMP WITH TIME ZONE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "hotlaps" DROP COLUMN "deletedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "hotlaps" DROP COLUMN "openGamePanelData"
        `);
    await queryRunner.query(`
            ALTER TABLE "hotlaps" DROP COLUMN "entrylistUrl"
        `);
  }
}
