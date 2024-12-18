import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.user?.tenantId || request['tenantId'];

    if (tenantId) {
      // Add tenant context to request for use in services
      request['tenantContext'] = { tenantId };
    }

    return next.handle();
  }
}