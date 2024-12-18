import { SetMetadata } from '@nestjs/common';

export const SkipTenantCheck = () => SetMetadata('skipTenantCheck', true);