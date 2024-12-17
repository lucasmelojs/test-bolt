import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Use pgcrypto to hash the provided password and compare
    const result = await this.usersService.getManager().query(
      'SELECT encode(digest($1, \'sha256\'), \'hex\') = $2 as valid',
      [password, user.password]
    );

    if (result[0].valid) {
      const { password, ...result } = user;
      return result;
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    const payload: JwtPayload = { 
      email: user.email, 
      sub: user.id,
      role: user.role,
      tenantId: user.tenant?.id 
    };

    return {
      access_token: this.jwtService.sign(payload),
      email: user.email,
      role: user.role
    };
  }
}