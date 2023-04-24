import { MigrationInterface, QueryRunner } from 'typeorm';

export class createDriversTable1682353528672 implements MigrationInterface {
  name = 'createDriversTable1682353528672';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "drivers" (
                "id" character varying NOT NULL,
                "steamId" character varying,
                "firstName" character varying,
                "lastName" character varying,
                "preferedDriverNumber" integer,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_4f930c8592b1f3ed8afe84e38c9" UNIQUE ("steamId"),
                CONSTRAINT "PK_92ab3fb69e566d3eb0cae896047" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "drivers"."id" IS 'The discord id of the member'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "drivers"
        `);
  }
}
