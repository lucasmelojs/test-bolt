import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../../entities/client.entity';
import { User } from '../../entities/user.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PaginationOptions, PaginatedResponse } from '../../common/types/pagination.type';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const user = await this.userRepository.findOne({
      where: { id: createClientDto.userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${createClientDto.userId} not found`);
    }

    const existingClient = await this.clientRepository.findOne({
      where: { user: { id: createClientDto.userId } },
    });

    if (existingClient) {
      throw new ConflictException('Client profile already exists for this user');
    }

    const client = this.clientRepository.create({
      ...createClientDto,
      user,
    });

    return await this.clientRepository.save(client);
  }

  async findAll(options: PaginationOptions, tenantId?: string): Promise<PaginatedResponse<Client>> {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 10, 100);
    const skip = (page - 1) * limit;

    const queryBuilder = this.clientRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.user', 'user')
      .where('client.deletedAt IS NULL');

    if (tenantId) {
      queryBuilder.andWhere('user.tenantId = :tenantId', { tenantId });
    }

    const [clients, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('client.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data: clients,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { id, deletedAt: null },
      relations: ['user', 'appointments'],
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(id);

    if (updateClientDto.userId && updateClientDto.userId !== client.user.id) {
      const user = await this.userRepository.findOne({
        where: { id: updateClientDto.userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${updateClientDto.userId} not found`);
      }

      const existingClient = await this.clientRepository.findOne({
        where: { user: { id: updateClientDto.userId } },
      });

      if (existingClient) {
        throw new ConflictException('Client profile already exists for this user');
      }
    }

    Object.assign(client, updateClientDto);
    return await this.clientRepository.save(client);
  }

  async remove(id: string): Promise<void> {
    const client = await this.findOne(id);
    client.deletedAt = new Date();
    await this.clientRepository.save(client);
  }
}