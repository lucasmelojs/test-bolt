import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDateString, IsTimeString, IsBoolean } from 'class-validator';

export class CreateAvailabilityDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  providerId: string;

  @ApiProperty({ example: '2024-12-19' })
  @IsDateString()
  availableDate: string;

  @ApiProperty({ example: '09:00:00' })
  @IsTimeString()
  startTime: string;

  @ApiProperty({ example: '17:00:00' })
  @IsTimeString()
  endTime: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  isRecurring: boolean;
}