import { MigrationInterface, QueryRunner } from "typeorm";

export class createHotlapsTable1680003249147 implements MigrationInterface {
    name = 'createHotlapsTable1680003249147'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "hotlaps" (
                "id" SERIAL NOT NULL,
                "track" character varying NOT NULL,
                "laptimes" text array NOT NULL,
                "driverId" integer NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_e6720f86e3c6d91be3ab970b14f" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "drivers" (
                "id" SERIAL NOT NULL,
                "steamId" character varying NOT NULL,
                "discordId" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_92ab3fb69e566d3eb0cae896047" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "hotlaps"
            ADD CONSTRAINT "FK_313bea4564de2dda0b50357a4db" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "hotlaps" DROP CONSTRAINT "FK_313bea4564de2dda0b50357a4db"
        `);
        await queryRunner.query(`
            DROP TABLE "drivers"
        `);
        await queryRunner.query(`
            DROP TABLE "hotlaps"
        `);
    }

}
