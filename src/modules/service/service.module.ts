import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';
import { Service } from '../../entities/service.entity';
import { Provider } from '../../entities/provider.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Service, Provider])],
  controllers: [ServiceController],
  providers: [ServiceService],
  exports: [ServiceService],
})
export class ServiceModule {}