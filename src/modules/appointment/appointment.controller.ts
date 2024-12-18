import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment, AppointmentStatus } from '../../entities/appointment.entity';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { CurrentTenant } from '../auth/decorators/tenant.decorator';
import { PaginationOptions } from '../../common/types/pagination.type';
import { UserRole } from '../../entities/user.entity';

@ApiTags('Appointments')
@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({ status: 201, description: 'Appointment created successfully', type: Appointment })
  async create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @CurrentUser() currentUser: any,
    @CurrentTenant() tenantId: string,
  ): Promise<Appointment> {
    // Clients can only create appointments for themselves
    if (currentUser.role === UserRole.CLIENT && 
        createAppointmentDto.clientId !== currentUser.id) {
      throw new ForbiddenException('You can only create appointments for yourself');
    }

    return this.appointmentService.create(createAppointmentDto, tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all appointments' })
  @ApiResponse({ status: 200, description: 'Returns all appointments', type: [Appointment] })
  async findAll(
    @Query() paginationOptions: PaginationOptions,
    @CurrentUser() currentUser: any,
    @CurrentTenant() tenantId: string,
    @Query('clientId') clientId?: string,
    @Query('providerId') providerId?: string,
    @Query('date') date?: string,
    @Query('status') status?: AppointmentStatus,
  ) {
    // Filter based on user role
    if (currentUser.role === UserRole.CLIENT) {
      clientId = currentUser.id;
    } else if (currentUser.role === UserRole.PROVIDER) {
      providerId = currentUser.id;
    }

    return this.appointmentService.findAll(
      paginationOptions,
      tenantId,
      { clientId, providerId, date, status }
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment by id' })
  @ApiResponse({ status: 200, description: 'Returns the appointment', type: Appointment })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: any,
    @CurrentTenant() tenantId: string,
  ): Promise<Appointment> {
    const appointment = await this.appointmentService.findOne(id, tenantId);

    // Check access based on user role
    if (currentUser.role === UserRole.CLIENT && 
        appointment.client.id !== currentUser.id) {
      throw new ForbiddenException('You can only view your own appointments');
    }
    if (currentUser.role === UserRole.PROVIDER && 
        appointment.provider.id !== currentUser.id) {
      throw new ForbiddenException('You can only view appointments assigned to you');
    }

    return appointment;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update appointment' })
  @ApiResponse({ status: 200, description: 'Appointment updated successfully', type: Appointment })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @CurrentUser() currentUser: any,
    @CurrentTenant() tenantId: string,
  ): Promise<Appointment> {
    const appointment = await this.appointmentService.findOne(id, tenantId);

    // Check permissions based on role and status change
    if (currentUser.role === UserRole.CLIENT) {
      if (appointment.client.id !== currentUser.id) {
        throw new ForbiddenException('You can only update your own appointments');
      }
      // Clients can only cancel appointments
      if (updateAppointmentDto.status && 
          updateAppointmentDto.status !== AppointmentStatus.CANCELED) {
        throw new ForbiddenException('Clients can only cancel appointments');
      }
    } else if (currentUser.role === UserRole.PROVIDER) {
      if (appointment.provider.id !== currentUser.id) {
        throw new ForbiddenException('You can only update appointments assigned to you');
      }
      // Providers can only update status
      const allowedUpdates = ['status'];
      const attemptedUpdates = Object.keys(updateAppointmentDto);
      if (!attemptedUpdates.every(update => allowedUpdates.includes(update))) {
        throw new ForbiddenException('Providers can only update appointment status');
      }
    }

    return this.appointmentService.update(id, updateAppointmentDto, tenantId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete appointment' })
  @ApiResponse({ status: 200, description: 'Appointment deleted successfully' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<void> {
    return this.appointmentService.remove(id, tenantId);
  }
}