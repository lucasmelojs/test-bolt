# Multi-Tenant Appointments Management System

## Overview

A secure, multi-tenant appointment management system built with NestJS, featuring:

- 🔐 Multi-tenant architecture
- 🔒 Secure authentication with pgcrypto
- 🎫 JWT-based authorization
- 📝 Complete appointment management
- 👥 User role management
- 📊 Service provider management
- 📅 Availability management

## Security Features

- Password hashing using pgcrypto
- JWT authentication with refresh tokens
- Role-based access control
- Tenant isolation
- Rate limiting
- CORS protection
- Helmet security headers

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v15 or higher)
- Docker (optional)

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd multi-tenant-appointments
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run database migrations:
```bash
npm run migration:run
```

## Running the Application

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

### Docker
```bash
docker-compose up
```

## API Documentation

Swagger documentation is available at `/docs` when running the application.

## Database Schema

### Core Entities

- **Tenants**: Multi-tenant support
- **Users**: Base user management
- **Clients**: Client profiles
- **Providers**: Service provider profiles
- **Services**: Available services
- **Appointments**: Appointment management
- **Availability**: Provider availability slots

## Development

### Creating New Migrations

```bash
npm run migration:create -- -n YourMigrationName
```

### Generate Migration from Changes

```bash
npm run migration:generate -- -n YourMigrationName
```

### Running Tests

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Features

- [x] Multi-tenant support
- [x] User authentication
- [x] Role-based authorization
- [x] Appointment management
- [x] Service management
- [x] Provider availability
- [x] Client management
- [x] Soft deletions
- [ ] Email notifications
- [ ] Payment integration
- [ ] Analytics dashboard

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
