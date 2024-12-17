declare enum Environment {
    Development = "development",
    Production = "production",
    Test = "test"
}
export declare class EnvironmentVariables {
    NODE_ENV: Environment;
    PORT: number;
    DATABASE_HOST: string;
    DATABASE_PORT: number;
    DATABASE_NAME: string;
    DATABASE_USER: string;
    DATABASE_PASSWORD: string;
    JWT_SECRET: string;
    JWT_EXPIRATION: number;
    THROTTLE_TTL: number;
    THROTTLE_LIMIT: number;
}
export declare function validate(config: Record<string, unknown>): EnvironmentVariables;
export {};
