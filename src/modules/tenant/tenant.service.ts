import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../../entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { PaginationOptions, PaginatedResponse } from '../../common/types/pagination.type';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    const existingTenant = await this.tenantRepository.findOne({
      where: [
        { name: createTenantDto.name },
        { domain: createTenantDto.domain },
      ],
    });

    if (existingTenant) {
      throw new ConflictException('Tenant with this name or domain already exists');
    }

    const tenant = this.tenantRepository.create(createTenantDto);
    return await this.tenantRepository.save(tenant);
  }

  async findAll(options: PaginationOptions): Promise<PaginatedResponse<Tenant>> {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 10, 100);
    const skip = (page - 1) * limit;

    const [tenants, total] = await this.tenantRepository.findAndCount({
      where: { deletedAt: null },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: tenants,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { id, deletedAt: null },
      relations: ['users'],
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    return tenant;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findOne(id);

    if (updateTenantDto.name || updateTenantDto.domain) {
      const existingTenant = await this.tenantRepository.findOne({
        where: [
          { name: updateTenantDto.name, id: !id },
          { domain: updateTenantDto.domain, id: !id },
        ],
      });

      if (existingTenant) {
        throw new ConflictException('Tenant with this name or domain already exists');
      }
    }

    Object.assign(tenant, updateTenantDto);
    return await this.tenantRepository.save(tenant);
  }

  async remove(id: string): Promise<void> {
    const tenant = await this.findOne(id);
    tenant.deletedAt = new Date();
    tenant.isActive = false;
    await this.tenantRepository.save(tenant);
  }

  async findByDomain(domain: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { domain, isActive: true, deletedAt: null },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant not found for domain ${domain}`);
    }

    return tenant;
  }
}