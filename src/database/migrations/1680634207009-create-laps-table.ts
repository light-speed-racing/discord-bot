import { MigrationInterface, QueryRunner } from 'typeorm';

export class createLapsTable1680634207009 implements MigrationInterface {
  name = 'createLapsTable1680634207009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "hotlaps" DROP CONSTRAINT "FK_3053c649afccd868f924c215056"
        `);
    await queryRunner.query(`
            CREATE TABLE "laps" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "car" integer NOT NULL,
                "carGroup" character varying NOT NULL,
                "times" jsonb NOT NULL,
                "entity" jsonb,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "hotlapId" uuid,
                "driverSteamId" character varying,
                CONSTRAINT "PK_2ef05004e276318aa254bca4901" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "hotlaps" DROP COLUMN "driverSteamId"
        `);
    await queryRunner.query(`
            ALTER TABLE "hotlaps" DROP COLUMN "laptimes"
        `);
    await queryRunner.query(`
            ALTER TABLE "hotlaps" DROP COLUMN "car"
        `);
    await queryRunner.query(`
            ALTER TABLE "hotlaps"
            ADD "title" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "laps"
            ADD CONSTRAINT "FK_7a38268e2d155a94125249ab905" FOREIGN KEY ("hotlapId") REFERENCES "hotlaps"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "laps"
            ADD CONSTRAINT "FK_37717d001c3e23e1a6f7bee01ef" FOREIGN KEY ("driverSteamId") REFERENCES "drivers"("steamId") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "laps" DROP CONSTRAINT "FK_37717d001c3e23e1a6f7bee01ef"
        `);
    await queryRunner.query(`
            ALTER TABLE "laps" DROP CONSTRAINT "FK_7a38268e2d155a94125249ab905"
        `);
    await queryRunner.query(`
            ALTER TABLE "hotlaps" DROP COLUMN "title"
        `);
    await queryRunner.query(`
            ALTER TABLE "hotlaps"
            ADD "car" integer NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "hotlaps"
            ADD "laptimes" text NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "hotlaps"
            ADD "driverSteamId" character varying
        `);
    await queryRunner.query(`
            DROP TABLE "laps"
        `);
    await queryRunner.query(`
            ALTER TABLE "hotlaps"
            ADD CONSTRAINT "FK_3053c649afccd868f924c215056" FOREIGN KEY ("driverSteamId") REFERENCES "drivers"("steamId") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
