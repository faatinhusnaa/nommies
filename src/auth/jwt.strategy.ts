import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'NomNom@67',
    });
  }

  async validate(payload: any) {
    const userId = payload.sub ?? payload.id;

    // Fetch the live, up-to-date record from the database
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    // Attach the LIVE role from PostgreSQL to req.user
    return {
      id: user.id,
      email: user.email,
      role: user.role, // Live role from DB overrides what was inside the token!
    };
  }
}