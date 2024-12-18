import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret'),
    });
  }

  async validate(payload: any) {
    const user = await this.userRepository.findOne({
      where: { 
        id: payload.sub, 
        isActive: true,
        deletedAt: null
      },
      relations: ['tenant'],
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.tenant && !user.tenant.isActive) {
      throw new UnauthorizedException('Tenant is inactive');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenant?.id,
    };
  }
}