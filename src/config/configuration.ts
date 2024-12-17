export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : 5432,
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'test-bolt',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret',
    expiresIn: process.env.JWT_EXPIRATION || '1h',
  },
  throttle: {
    ttl: process.env.RATE_LIMIT_TTL ? parseInt(process.env.RATE_LIMIT_TTL, 10) : 60,
    limit: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX, 10) : 100,
  },
});