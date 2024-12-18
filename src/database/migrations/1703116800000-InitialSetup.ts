import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSetup1703116800000 implements MigrationInterface {
  name = 'InitialSetup1703116800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable pgcrypto extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

    // Create enums
    await queryRunner.query(`
      CREATE TYPE user_role_enum AS ENUM ('admin', 'client', 'provider');
      CREATE TYPE appointment_status_enum AS ENUM ('pending', 'confirmed', 'completed', 'canceled');
      CREATE TYPE commission_type_enum AS ENUM ('percentage', 'fixed');
    `);

    // Create tenants table
    await queryRunner.query(`
      CREATE TABLE tenants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL UNIQUE,
        domain VARCHAR(255) NOT NULL UNIQUE,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now(),
        deleted_at TIMESTAMP
      )
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(20) NOT NULL,
        password TEXT NOT NULL,
        role user_role_enum NOT NULL DEFAULT 'client',
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now(),
        deleted_at TIMESTAMP
      )
    `);

    // Create clients table
    await queryRunner.query(`
      CREATE TABLE clients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE REFERENCES users(id),
        preferences JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now(),
        deleted_at TIMESTAMP
      )
    `);

    // Create providers table
    await queryRunner.query(`
      CREATE TABLE providers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE REFERENCES users(id),
        commission_type commission_type_enum NOT NULL DEFAULT 'percentage',
        default_commission DECIMAL(5,2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now(),
        deleted_at TIMESTAMP
      )
    `);

    // Create services table
    await queryRunner.query(`
      CREATE TABLE services (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        provider_id UUID NOT NULL REFERENCES providers(id),
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        duration INTEGER NOT NULL,
        provider_commission DECIMAL(5,2) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now(),
        deleted_at TIMESTAMP
      )
    `);

    // Create appointments table
    await queryRunner.query(`
      CREATE TABLE appointments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        client_id UUID NOT NULL REFERENCES clients(id),
        provider_id UUID NOT NULL REFERENCES providers(id),
        service_id UUID NOT NULL REFERENCES services(id),
        scheduled_date DATE NOT NULL,
        scheduled_time TIME NOT NULL,
        status appointment_status_enum NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now(),
        deleted_at TIMESTAMP
      )
    `);

    // Create availability table
    await queryRunner.query(`
      CREATE TABLE availability (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        provider_id UUID NOT NULL REFERENCES providers(id),
        available_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        is_recurring BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX idx_users_tenant_id ON users(tenant_id);
      CREATE INDEX idx_users_email ON users(email);
      CREATE INDEX idx_services_provider_id ON services(provider_id);
      CREATE INDEX idx_appointments_client_id ON appointments(client_id);
      CREATE INDEX idx_appointments_provider_id ON appointments(provider_id);
      CREATE INDEX idx_appointments_service_id ON appointments(service_id);
      CREATE INDEX idx_appointments_scheduled_date ON appointments(scheduled_date);
      CREATE INDEX idx_availability_provider_id ON availability(provider_id);
      CREATE INDEX idx_availability_date ON availability(available_date);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_users_tenant_id;
      DROP INDEX IF EXISTS idx_users_email;
      DROP INDEX IF EXISTS idx_services_provider_id;
      DROP INDEX IF EXISTS idx_appointments_client_id;
      DROP INDEX IF EXISTS idx_appointments_provider_id;
      DROP INDEX IF EXISTS idx_appointments_service_id;
      DROP INDEX IF EXISTS idx_appointments_scheduled_date;
      DROP INDEX IF EXISTS idx_availability_provider_id;
      DROP INDEX IF EXISTS idx_availability_date;
    `);

    // Drop tables
    await queryRunner.query(`
      DROP TABLE IF EXISTS availability;
      DROP TABLE IF EXISTS appointments;
      DROP TABLE IF EXISTS services;
      DROP TABLE IF EXISTS providers;
      DROP TABLE IF EXISTS clients;
      DROP TABLE IF EXISTS users;
      DROP TABLE IF EXISTS tenants;
    `);

    // Drop enums
    await queryRunner.query(`
      DROP TYPE IF EXISTS user_role_enum;
      DROP TYPE IF EXISTS appointment_status_enum;
      DROP TYPE IF EXISTS commission_type_enum;
    `);

    // Drop extension
    await queryRunner.query(`DROP EXTENSION IF EXISTS pgcrypto`);
  }
}