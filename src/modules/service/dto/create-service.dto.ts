import { IsString, IsNumber, Min, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({ example: 'Haircut' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Professional haircut service' })
  @IsString()
  description: string;

  @ApiProperty({ example: 50.00 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 30 })
  @IsNumber()
  @Min(1)
  duration: number;

  @ApiProperty({ example: 20.00 })
  @IsNumber()
  @Min(0)
  providerCommission: number;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  providerId: string;
}