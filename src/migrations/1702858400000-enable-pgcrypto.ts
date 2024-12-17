import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnablePgcrypto1702858400000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable pgcrypto extension
        await queryRunner.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
        
        // Add role column to user table
        await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "role" VARCHAR(50) NOT NULL DEFAULT 'user';`);
        
        // Create function to hash password using pgcrypto
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION hash_password(password TEXT) 
            RETURNS TEXT AS $$
            BEGIN
                RETURN encode(digest($1, 'sha256'), 'hex');
            END;
            $$ LANGUAGE plpgsql IMMUTABLE;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the hash_password function
        await queryRunner.query('DROP FUNCTION IF EXISTS hash_password;');
        
        // Remove role column
        await queryRunner.query('ALTER TABLE "user" DROP COLUMN IF EXISTS "role";');
        
        // We don't disable pgcrypto as it might be used by other parts of the application
    }
}
