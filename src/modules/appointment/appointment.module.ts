import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { Appointment } from '../../entities/appointment.entity';
import { Client } from '../../entities/client.entity';
import { Provider } from '../../entities/provider.entity';
import { Service } from '../../entities/service.entity';
import { AvailabilityModule } from '../availability/availability.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, Client, Provider, Service]),
    AvailabilityModule,
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export class AppointmentModule {}