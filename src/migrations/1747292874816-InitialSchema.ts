import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1747292874816 implements MigrationInterface {
    name = 'InitialSchema1747292874816'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."files_status_enum" AS ENUM('uploaded', 'processing', 'processed', 'failed')`);
        await queryRunner.query(`CREATE TABLE "files" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "original_filename" character varying NOT NULL, "storage_path" character varying NOT NULL, "title" character varying, "description" character varying, "status" "public"."files_status_enum" NOT NULL DEFAULT 'uploaded', "extracted_data" character varying, "uploaded_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."jobs_status_enum" AS ENUM('queued', 'processing', 'completed', 'failed')`);
        await queryRunner.query(`CREATE TABLE "jobs" ("id" SERIAL NOT NULL, "file_id" integer NOT NULL, "job_type" character varying NOT NULL, "status" "public"."jobs_status_enum" NOT NULL DEFAULT 'queued', "error_message" character varying, "started_at" TIMESTAMP, "completed_at" TIMESTAMP, CONSTRAINT "PK_cf0a6c42b72fcc7f7c237def345" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "files" ADD CONSTRAINT "FK_a7435dbb7583938d5e7d1376041" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD CONSTRAINT "FK_cf315a2742eb770e9f9f420d8a5" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_cf315a2742eb770e9f9f420d8a5"`);
        await queryRunner.query(`ALTER TABLE "files" DROP CONSTRAINT "FK_a7435dbb7583938d5e7d1376041"`);
        await queryRunner.query(`DROP TABLE "jobs"`);
        await queryRunner.query(`DROP TYPE "public"."jobs_status_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "files"`);
        await queryRunner.query(`DROP TYPE "public"."files_status_enum"`);
    }

}
