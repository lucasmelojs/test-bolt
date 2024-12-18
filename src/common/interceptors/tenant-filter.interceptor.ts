import { Injectable, NestInterceptor, ExecutionContext, CallHandler, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';

@Injectable()
export class TenantFilterInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const skipTenantCheck = this.reflector.getAllAndOverride<boolean>('skipTenantCheck', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipTenantCheck) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const userTenantId = request.user?.tenantId;

    return next.handle().pipe(
      map((data) => {
        if (!data) return data;

        if (Array.isArray(data)) {
          return data.filter((item) => this.belongsToTenant(item, userTenantId));
        }

        if (typeof data === 'object' && data.tenantId && data.tenantId !== userTenantId) {
          throw new ForbiddenException('Resource belongs to a different tenant');
        }

        return data;
      }),
    );
  }

  private belongsToTenant(item: any, tenantId: string): boolean {
    if (!item || !tenantId) return true;
    if (typeof item !== 'object') return true;
    return !item.tenantId || item.tenantId === tenantId;
  }
}