import { MigrationInterface, QueryRunner } from 'typeorm';

export class createDriversTable1680612760642 implements MigrationInterface {
  name = 'createDriversTable1680612760642';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "drivers" (
                "steamId" character varying NOT NULL,
                "discordId" character varying,
                "firstName" character varying,
                "lastName" character varying,
                "preferedDriverNumber" integer,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_7577021b0595458a213d5bdba6d" UNIQUE ("steamId", "discordId"),
                CONSTRAINT "PK_4f930c8592b1f3ed8afe84e38c9" PRIMARY KEY ("steamId")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "drivers"
        `);
  }
}
