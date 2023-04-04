import { MigrationInterface, QueryRunner } from 'typeorm';

export class createHotlapsTable1680615412075 implements MigrationInterface {
  name = 'createHotlapsTable1680615412075';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "hotlaps" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "track" character varying NOT NULL,
                "car" integer NOT NULL,
                "laptimes" text NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "driverSteamId" character varying,
                CONSTRAINT "PK_e6720f86e3c6d91be3ab970b14f" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "hotlaps"
            ADD CONSTRAINT "FK_3053c649afccd868f924c215056" FOREIGN KEY ("driverSteamId") REFERENCES "drivers"("steamId") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "hotlaps" DROP CONSTRAINT "FK_3053c649afccd868f924c215056"
        `);
    await queryRunner.query(`
            DROP TABLE "hotlaps"
        `);
  }
}
