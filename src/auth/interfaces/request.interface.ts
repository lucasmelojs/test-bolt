import { Request } from 'express';
import { UserRole } from '../../users/entities/user.entity';

export interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    role: UserRole;
    tenantId?: string;
  };
  tenantId?: string;
}