declare const _default: () => {
    port: number;
    database: {
        host: string | undefined;
        port: number;
        username: string | undefined;
        password: string | undefined;
        database: string | undefined;
    };
    jwt: {
        secret: string | undefined;
        expiresIn: string;
    };
    cors: {
        origin: string | string[];
        methods: string[];
    };
    rateLimit: {
        ttl: number;
        limit: number;
    };
};
export default _default;
