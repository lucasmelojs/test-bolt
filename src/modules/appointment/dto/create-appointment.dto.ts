import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDateString, IsTimeString, IsEnum } from 'class-validator';
import { AppointmentStatus } from '../../../entities/appointment.entity';

export class CreateAppointmentDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  clientId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  providerId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  serviceId: string;

  @ApiProperty({ example: '2024-12-19' })
  @IsDateString()
  scheduledDate: string;

  @ApiProperty({ example: '14:00:00' })
  @IsTimeString()
  scheduledTime: string;

  @ApiProperty({ enum: AppointmentStatus, example: AppointmentStatus.PENDING })
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;
}