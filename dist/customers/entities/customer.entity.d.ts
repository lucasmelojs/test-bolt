import { Tenant } from '../../tenants/entities/tenant.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
export declare class Customer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    tenant: Tenant;
    appointments: Appointment[];
    createdAt: Date;
    updatedAt: Date;
}
