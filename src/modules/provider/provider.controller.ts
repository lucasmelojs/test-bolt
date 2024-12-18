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
import { ProviderService } from './provider.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { Provider } from '../../entities/provider.entity';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { CurrentTenant } from '../auth/decorators/tenant.decorator';
import { PaginationOptions } from '../../common/types/pagination.type';
import { UserRole } from '../../entities/user.entity';

@ApiTags('Providers')
@Controller('providers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new provider profile' })
  @ApiResponse({ status: 201, description: 'Provider profile created successfully', type: Provider })
  async create(
    @Body() createProviderDto: CreateProviderDto,
    @CurrentTenant() tenantId: string,
  ): Promise<Provider> {
    return this.providerService.create(createProviderDto, tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all provider profiles' })
  @ApiResponse({ status: 200, description: 'Returns all provider profiles', type: [Provider] })
  async findAll(
    @Query() paginationOptions: PaginationOptions,
    @CurrentTenant() tenantId: string,
  ) {
    return this.providerService.findAll(paginationOptions, tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get provider profile by id' })
  @ApiResponse({ status: 200, description: 'Returns the provider profile', type: Provider })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: any,
    @CurrentTenant() tenantId: string,
  ): Promise<Provider> {
    const provider = await this.providerService.findOne(id, tenantId);
    
    // Providers can only view their own profile unless they're admin
    if (currentUser.role === UserRole.PROVIDER && provider.user.id !== currentUser.id) {
      throw new ForbiddenException('You can only view your own profile');
    }
    
    return provider;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update provider profile' })
  @ApiResponse({ status: 200, description: 'Provider profile updated successfully', type: Provider })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProviderDto: UpdateProviderDto,
    @CurrentUser() currentUser: any,
    @CurrentTenant() tenantId: string,
  ): Promise<Provider> {
    const provider = await this.providerService.findOne(id, tenantId);
    
    // Providers can only update their own profile unless they're admin
    if (currentUser.role !== UserRole.ADMIN && provider.user.id !== currentUser.id) {
      throw new ForbiddenException('You can only update your own profile');
    }
    
    return this.providerService.update(id, updateProviderDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete provider profile' })
  @ApiResponse({ status: 200, description: 'Provider profile deleted successfully' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<void> {
    return this.providerService.remove(id, tenantId);
  }

  @Get(':id/services')
  @ApiOperation({ summary: 'Get provider services' })
  @ApiResponse({ status: 200, description: 'Returns provider services' })
  async getServices(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.providerService.getServices(id, tenantId);
  }

  @Get(':id/availability')
  @ApiOperation({ summary: 'Get provider availability' })
  @ApiResponse({ status: 200, description: 'Returns provider availability slots' })
  async getAvailability(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('date') date: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.providerService.getAvailability(id, date, tenantId);
  }

  @Get(':id/appointments')
  @ApiOperation({ summary: 'Get provider appointments' })
  @ApiResponse({ status: 200, description: 'Returns provider appointments' })
  async getAppointments(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() paginationOptions: PaginationOptions,
    @CurrentTenant() tenantId: string,
  ) {
    return this.providerService.getAppointments(id, paginationOptions, tenantId);
  }
}