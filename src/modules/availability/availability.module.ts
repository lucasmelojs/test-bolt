import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';
import { Availability } from '../../entities/availability.entity';
import { Provider } from '../../entities/provider.entity';
import { Appointment } from '../../entities/appointment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Availability, Provider, Appointment])],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}