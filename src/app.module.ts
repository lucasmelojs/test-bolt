import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// Config imports
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import appConfig from './config/app.config';

// Entity imports
import { Tenant } from './entities/tenant.entity';
import { User } from './entities/user.entity';
import { Client } from './entities/client.entity';
import { Provider } from './entities/provider.entity';
import { Service } from './entities/service.entity';
import { Appointment } from './entities/appointment.entity';
import { Availability } from './entities/availability.entity';

// Core Modules
import { AuthModule } from './auth/auth.module';
import { TenantModule } from './tenant/tenant.module';
import { UserModule } from './user/user.module';
import { ClientModule } from './client/client.module';
import { ProviderModule } from './provider/provider.module';

// Guards
import { JwtAuthGuard } from './auth/guards/jwt.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { ThrottlerBehindProxyGuard } from './common/guards/throttler-proxy.guard';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, appConfig],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
        entities: [
          Tenant,
          User,
          Client,
          Provider,
          Service,
          Appointment,
          Availability,
        ],
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: config.get('app.rateLimitTtl'),
        limit: config.get('app.rateLimitLimit'),
      }),
    }),

    // Feature Modules
    AuthModule,
    TenantModule,
    UserModule,
    ClientModule,
    ProviderModule,
  ],
  providers: [
    // Global Guards
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
