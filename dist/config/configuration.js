"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => {
    var _a;
    return ({
        port: parseInt(process.env.PORT, 10) || 3000,
        database: {
            host: process.env.DATABASE_HOST,
            port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
            username: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
        },
        jwt: {
            secret: process.env.JWT_SECRET,
            expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        },
        cors: {
            origin: ((_a = process.env.CORS_ORIGIN) === null || _a === void 0 ? void 0 : _a.split(',')) || '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        },
        rateLimit: {
            ttl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60,
            limit: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
        },
    });
};
//# sourceMappingURL=configuration.js.map