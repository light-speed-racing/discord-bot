import { MigrationInterface, QueryRunner } from "typeorm";

export class createDriversTable1679939008864 implements MigrationInterface {
    name = 'createDriversTable1679939008864'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "drivers" DROP CONSTRAINT "FK_ecc778b00c38b0f6824e3c9b105"
        `);
        await queryRunner.query(`
            ALTER TABLE "drivers" DROP COLUMN "hotlapsId"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "drivers"
            ADD "hotlapsId" integer
        `);
        await queryRunner.query(`
            ALTER TABLE "drivers"
            ADD CONSTRAINT "FK_ecc778b00c38b0f6824e3c9b105" FOREIGN KEY ("hotlapsId") REFERENCES "hotlaps"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
