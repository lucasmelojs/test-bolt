import { Tenant } from '../../tenants/entities/tenant.entity';
export declare class User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    isActive: boolean;
    tenant: Tenant;
    createdAt: Date;
    updatedAt: Date;
}
