import { plainToClass } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync, IsOptional } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment;

  @IsNumber()
  @IsOptional()
  PORT: number;

  @IsString()
  DATABASE_HOST: string;

  @IsNumber()
  @IsOptional()
  DATABASE_PORT: number;

  @IsString()
  DATABASE_USERNAME: string;

  @IsString()
  DATABASE_PASSWORD: string;

  @IsString()
  DATABASE_NAME: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRATION: string;

  @IsNumber()
  @IsOptional()
  RATE_LIMIT_TTL: number;

  @IsNumber()
  @IsOptional()
  RATE_LIMIT_MAX: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: true,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}