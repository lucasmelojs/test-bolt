import { IsUUID, IsObject, IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ClientPreferencesDto {
  @ApiProperty({ example: 'en' })
  @IsString()
  language: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  notifications: boolean;
}

export class CreateClientDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  userId: string;

  @ApiProperty()
  @IsObject()
  @IsOptional()
  preferences?: ClientPreferencesDto;
}