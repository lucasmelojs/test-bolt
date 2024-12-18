import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationOptions, PaginatedResponse } from '../../common/types/pagination.type';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const hashedPassword = await queryRunner.query(
        `SELECT crypt($1, gen_salt('bf', 10)) as hash`,
        [createUserDto.password]
      );

      const user = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword[0].hash,
      });

      const savedUser = await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();

      // Remove password from response
      delete savedUser.password;
      return savedUser;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(options: PaginationOptions, tenantId?: string): Promise<PaginatedResponse<User>> {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 10, 100);
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .where('user.deletedAt IS NULL')
      .leftJoinAndSelect('user.tenant', 'tenant');

    if (tenantId) {
      queryBuilder.andWhere('tenant.id = :tenantId', { tenantId });
    }

    const [users, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

    // Remove passwords from response
    users.forEach(user => delete user.password);

    return {
      data: users,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, deletedAt: null },
      relations: ['tenant'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Remove password from response
    delete user.password;
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    Object.assign(user, updateUserDto);
    const savedUser = await this.userRepository.save(user);
    
    // Remove password from response
    delete savedUser.password;
    return savedUser;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    user.deletedAt = new Date();
    user.isActive = false;
    await this.userRepository.save(user);
  }

  async updatePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const isValid = await queryRunner.query(
        `SELECT (password = crypt($1, password)) as valid FROM users WHERE id = $2 AND is_active = true`,
        [oldPassword, userId]
      );

      if (!isValid[0].valid) {
        throw new UnauthorizedException('Invalid current password');
      }

      const hashedPassword = await queryRunner.query(
        `SELECT crypt($1, gen_salt('bf', 10)) as hash`,
        [newPassword]
      );

      await queryRunner.query(
        `UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2`,
        [hashedPassword[0].hash, userId]
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({
      where: { email, isActive: true, deletedAt: null },
      relations: ['tenant'],
    });
    return user;
  }
}