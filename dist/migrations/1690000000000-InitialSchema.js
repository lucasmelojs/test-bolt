"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitialSchema1690000000000 = void 0;
class InitialSchema1690000000000 {
    constructor() {
        this.name = 'InitialSchema1690000000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE "tenant" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL,
        "domain" varchar NOT NULL UNIQUE,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      );

      CREATE TABLE "user" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "firstName" varchar NOT NULL,
        "lastName" varchar NOT NULL,
        "email" varchar NOT NULL UNIQUE,
        "password" varchar NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "tenantId" uuid REFERENCES "tenant"("id"),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      );

      CREATE INDEX "IDX_user_email" ON "user"("email");
      CREATE INDEX "IDX_user_tenant" ON "user"("tenantId");
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      DROP INDEX "IDX_user_tenant";
      DROP INDEX "IDX_user_email";
      DROP TABLE "user";
      DROP TABLE "tenant";
    `);
    }
}
exports.InitialSchema1690000000000 = InitialSchema1690000000000;
//# sourceMappingURL=1690000000000-InitialSchema.js.map