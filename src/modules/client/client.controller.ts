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
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from '../../entities/client.entity';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { CurrentTenant } from '../auth/decorators/tenant.decorator';
import { PaginationOptions } from '../../common/types/pagination.type';
import { UserRole } from '../../entities/user.entity';

@ApiTags('Clients')
@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new client profile' })
  @ApiResponse({ status: 201, description: 'Client profile created successfully', type: Client })
  async create(
    @Body() createClientDto: CreateClientDto,
    @CurrentTenant() tenantId: string,
  ): Promise<Client> {
    return this.clientService.create(createClientDto, tenantId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.PROVIDER)
  @ApiOperation({ summary: 'Get all client profiles' })
  @ApiResponse({ status: 200, description: 'Returns all client profiles', type: [Client] })
  async findAll(
    @Query() paginationOptions: PaginationOptions,
    @CurrentTenant() tenantId: string,
  ) {
    return this.clientService.findAll(paginationOptions, tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get client profile by id' })
  @ApiResponse({ status: 200, description: 'Returns the client profile', type: Client })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: any,
    @CurrentTenant() tenantId: string,
  ): Promise<Client> {
    const client = await this.clientService.findOne(id);
    
    // Users can only view their own profile unless they're admin or provider
    if (currentUser.role === UserRole.CLIENT && client.user.id !== currentUser.id) {
      throw new ForbiddenException('You can only view your own profile');
    }
    
    return client;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update client profile' })
  @ApiResponse({ status: 200, description: 'Client profile updated successfully', type: Client })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateClientDto: UpdateClientDto,
    @CurrentUser() currentUser: any,
  ): Promise<Client> {
    const client = await this.clientService.findOne(id);
    
    // Users can only update their own profile unless they're admin
    if (currentUser.role !== UserRole.ADMIN && client.user.id !== currentUser.id) {
      throw new ForbiddenException('You can only update your own profile');
    }
    
    return this.clientService.update(id, updateClientDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete client profile' })
  @ApiResponse({ status: 200, description: 'Client profile deleted successfully' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<void> {
    return this.clientService.remove(id, tenantId);
  }
}