import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { Availability } from '../../entities/availability.entity';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { CurrentTenant } from '../auth/decorators/tenant.decorator';
import { UserRole } from '../../entities/user.entity';
import { PaginationOptions } from '../../common/types/pagination.type';

@ApiTags('Availability')
@Controller('availability')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PROVIDER)
  @ApiOperation({ summary: 'Create availability slots' })
  @ApiResponse({ 
    status: 201, 
    description: 'Availability slots created successfully', 
    type: Availability 
  })
  async create(
    @Body() createAvailabilityDto: CreateAvailabilityDto,
    @CurrentUser() currentUser: any,
    @CurrentTenant() tenantId: string,
  ): Promise<Availability> {
    // Providers can only create availability for themselves
    if (currentUser.role === UserRole.PROVIDER && 
        createAvailabilityDto.providerId !== currentUser.id) {
      throw new ForbiddenException('You can only create availability slots for yourself');
    }

    // Validate time range
    if (createAvailabilityDto.startTime >= createAvailabilityDto.endTime) {
      throw new BadRequestException('End time must be after start time');
    }

    return this.availabilityService.create(createAvailabilityDto, tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Get availability slots' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns availability slots', 
    type: [Availability] 
  })
  async findAll(
    @Query() paginationOptions: PaginationOptions,
    @CurrentTenant() tenantId: string,
    @Query('providerId') providerId?: string,
    @Query('date') date?: string,
  ) {
    return this.availabilityService.findAll(
      paginationOptions,
      tenantId,
      providerId,
      date
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get availability slot by id' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the availability slot', 
    type: Availability 
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<Availability> {
    return this.availabilityService.findOne(id, tenantId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.PROVIDER)
  @ApiOperation({ summary: 'Delete availability slot' })
  @ApiResponse({ status: 200, description: 'Availability slot deleted successfully' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: any,
    @CurrentTenant() tenantId: string,
  ): Promise<void> {
    const availability = await this.availabilityService.findOne(id, tenantId);

    // Providers can only delete their own availability slots
    if (currentUser.role === UserRole.PROVIDER && 
        availability.provider.id !== currentUser.id) {
      throw new ForbiddenException('You can only delete your own availability slots');
    }

    return this.availabilityService.remove(id, tenantId);
  }

  @Get('provider/:providerId/available-slots')
  @ApiOperation({ summary: 'Get available time slots for a provider' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns available time slots', 
    type: [String] 
  })
  async getAvailableSlots(
    @Param('providerId', ParseUUIDPipe) providerId: string,
    @Query('date') date: string,
    @CurrentTenant() tenantId: string,
  ): Promise<string[]> {
    if (!date) {
      throw new BadRequestException('Date is required');
    }
    return this.availabilityService.getAvailableSlots(providerId, date, tenantId);
  }
}