import { Customer } from '../../customers/entities/customer.entity';
import { User } from '../../users/entities/user.entity';
export declare class Appointment {
    id: string;
    date: Date;
    price: number;
    commissionRate: number;
    notes: string;
    status: string;
    customer: Customer;
    user: User;
    createdAt: Date;
    updatedAt: Date;
}
