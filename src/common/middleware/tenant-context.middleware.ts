import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from '../../modules/tenant/tenant.service';

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(private readonly tenantService: TenantService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.user?.tenantId;
    const host = req.get('host');

    try {
      if (!tenantId && host) {
        const domain = host.split(':')[0]; // Remove port if present
        const tenant = await this.tenantService.findByDomain(domain);
        if (tenant) {
          req['tenantId'] = tenant.id;
        }
      } else if (tenantId) {
        req['tenantId'] = tenantId;
      }
    } catch (error) {
      // If tenant not found, continue without setting tenantId
      console.error('Error in tenant context middleware:', error);
    }

    next();
  }
}