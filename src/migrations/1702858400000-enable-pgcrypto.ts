import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnablePgcrypto1702858400000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable pgcrypto extension
        await queryRunner.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
        
        // Add role column to user table if it doesn't exist
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                            WHERE table_name='user' AND column_name='role') THEN 
                    ALTER TABLE "user" ADD COLUMN "role" VARCHAR(50) NOT NULL DEFAULT 'user';
                END IF;
            END $$;
        `);
        
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
        
        // Remove role column if it exists
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF EXISTS (SELECT 1 FROM information_schema.columns 
                        WHERE table_name='user' AND column_name='role') THEN 
                    ALTER TABLE "user" DROP COLUMN "role";
                END IF;
            END $$;
        `);
        
        // We don't disable pgcrypto as it might be used by other parts of the application
    }
}