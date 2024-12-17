import { User } from '../../users/entities/user.entity';
import { Customer } from '../../customers/entities/customer.entity';
export declare class Tenant {
    id: string;
    name: string;
    domain: string;
    isActive: boolean;
    users: User[];
    customers: Customer[];
    createdAt: Date;
    updatedAt: Date;
}
