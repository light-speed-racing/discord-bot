import { MigrationInterface, QueryRunner } from 'typeorm';

export class createHotlapsTable1679938077278 implements MigrationInterface {
  name = 'createHotlapsTable1679938077278';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "hotlaps" (
                "id" SERIAL NOT NULL,
                "track" character varying NOT NULL,
                "laptimes" text NOT NULL,
                "driverId" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_e6720f86e3c6d91be3ab970b14f" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "hotlaps"
        `);
  }
}
