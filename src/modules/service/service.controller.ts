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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service } from '../../entities/service.entity';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { CurrentTenant } from '../auth/decorators/tenant.decorator';
import { PaginationOptions } from '../../common/types/pagination.type';
import { UserRole } from '../../entities/user.entity';

@ApiTags('Services')
@Controller('services')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PROVIDER)
  @ApiOperation({ summary: 'Create a new service' })
  @ApiResponse({ status: 201, description: 'Service created successfully', type: Service })
  async create(
    @Body() createServiceDto: CreateServiceDto,
    @CurrentUser() currentUser: any,
    @CurrentTenant() tenantId: string,
  ): Promise<Service> {
    // If provider, can only create services for themselves
    if (currentUser.role === UserRole.PROVIDER && 
        createServiceDto.providerId !== currentUser.id) {
      throw new ForbiddenException('You can only create services for yourself');
    }
    return this.serviceService.create(createServiceDto, tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all services' })
  @ApiResponse({ status: 200, description: 'Returns all services', type: [Service] })
  async findAll(
    @Query() paginationOptions: PaginationOptions,
    @CurrentTenant() tenantId: string,
    @Query('providerId') providerId?: string,
  ) {
    return this.serviceService.findAll(paginationOptions, tenantId, providerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service by id' })
  @ApiResponse({ status: 200, description: 'Returns the service', type: Service })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<Service> {
    return this.serviceService.findOne(id, tenantId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.PROVIDER)
  @ApiOperation({ summary: 'Update service' })
  @ApiResponse({ status: 200, description: 'Service updated successfully', type: Service })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @CurrentUser() currentUser: any,
    @CurrentTenant() tenantId: string,
  ): Promise<Service> {
    const service = await this.serviceService.findOne(id, tenantId);

    // If provider, can only update their own services
    if (currentUser.role === UserRole.PROVIDER && 
        service.provider.id !== currentUser.id) {
      throw new ForbiddenException('You can only update your own services');
    }

    return this.serviceService.update(id, updateServiceDto, tenantId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.PROVIDER)
  @ApiOperation({ summary: 'Delete service' })
  @ApiResponse({ status: 200, description: 'Service deleted successfully' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: any,
    @CurrentTenant() tenantId: string,
  ): Promise<void> {
    const service = await this.serviceService.findOne(id, tenantId);

    // If provider, can only delete their own services
    if (currentUser.role === UserRole.PROVIDER && 
        service.provider.id !== currentUser.id) {
      throw new ForbiddenException('You can only delete your own services');
    }

    return this.serviceService.remove(id, tenantId);
  }
}