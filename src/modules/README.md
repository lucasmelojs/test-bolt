# Module Organization

This directory contains all feature modules of the application. Each module follows a consistent structure:

```
modules/
  ├── auth/                 # Authentication module
  │   ├── dto/             # Data Transfer Objects
  │   ├── guards/          # Auth Guards
  │   ├── strategies/      # Passport Strategies
  │   ├── decorators/      # Custom Decorators
  │   ├── auth.service.ts  # Auth Service
  │   ├── auth.module.ts   # Module Definition
  │   └── auth.controller.ts # Controller
  │
  ├── tenant/              # Tenant module
  ├── user/                # User module
  ├── client/              # Client module
  └── provider/            # Provider module
```

Each module is responsible for a specific domain feature and follows NestJS best practices.