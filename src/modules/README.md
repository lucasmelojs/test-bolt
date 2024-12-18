# Modules Directory Structure

This directory contains all feature modules of the application following NestJS best practices:

```
modules/
├── auth/                # Authentication module
├── tenant/              # Tenant management module
├── user/                # User management module
├── client/              # Client module
├── provider/            # Provider module
├── service/             # Service module
├── appointment/         # Appointment module
└── availability/        # Availability module
```

Each module follows a consistent structure:

```
module/
├── dto/                 # Data Transfer Objects
├── entities/            # Entity definitions
├── guards/              # Module-specific guards
├── decorators/          # Custom decorators
├── module.ts            # Module definition
├── controller.ts        # Controller implementation
└── service.ts           # Service implementation
```

## Module Dependencies

- auth: Core authentication and authorization
- tenant: Multi-tenant functionality
- user: Base user management
- client: Client-specific features
- provider: Provider-specific features
- service: Service management
- appointment: Appointment handling
- availability: Time slot management
