import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateRefreshTokenEntity1757832395648 implements MigrationInterface {
    name = 'UpdateRefreshTokenEntity1757832395648'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "userAgent"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "ipAddress"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "ipAddress" inet`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "userAgent" character varying(255)`);
    }

}
