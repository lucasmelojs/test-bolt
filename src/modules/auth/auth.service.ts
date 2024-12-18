import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../../entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { TokenResponseDto } from './dto/token.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email, isActive: true },
      relations: ['tenant'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      const result = await queryRunner.query(
        `SELECT (password = crypt($1, password)) as valid FROM users WHERE id = $2 AND is_active = true`,
        [password, user.id]
      );
      
      if (!result?.[0]?.valid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return user;
    } finally {
      await queryRunner.release();
    }
  }

  async login(loginDto: LoginDto): Promise<TokenResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      tenantId: user.tenant?.id 
    };
    
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(
        { sub: user.id },
        { expiresIn: '7d', secret: this.configService.get('jwt.refreshSecret') }
      )
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<TokenResponseDto> {
    try {
      const decoded = await this.jwtService.verifyAsync(
        refreshTokenDto.refreshToken,
        { secret: this.configService.get('jwt.refreshSecret') }
      );

      const user = await this.userRepository.findOne({
        where: { id: decoded.sub, isActive: true },
        relations: ['tenant'],
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const payload = { 
        sub: user.id, 
        email: user.email, 
        role: user.role,
        tenantId: user.tenant?.id 
      };
      
      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(payload),
        this.jwtService.signAsync(
          { sub: user.id },
          { expiresIn: '7d', secret: this.configService.get('jwt.refreshSecret') }
        )
      ]);

      return {
        accessToken,
        refreshToken,
        expiresIn: 900,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async hashPassword(password: string): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      const result = await queryRunner.query(
        `SELECT crypt($1, gen_salt('bf', 10)) as hash`,
        [password]
      );
      return result[0].hash;
    } finally {
      await queryRunner.release();
    }
  }
}