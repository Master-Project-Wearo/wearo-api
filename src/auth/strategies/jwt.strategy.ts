import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TEST_JWT_SECRET } from '../constants';
import { AuthUser } from '../interfaces/auth-user.interface';

type JwtPayload = {
  sub?: string;
  email?: string;
  role?: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secret =
      process.env.SUPABASE_JWT_SECRET ??
      process.env.JWT_SECRET ??
      (process.env.NODE_ENV === 'test' ? TEST_JWT_SECRET : undefined);

    if (!secret) {
      throw new Error('SUPABASE_JWT_SECRET (or JWT_SECRET) must be set');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      algorithms: ['HS256'],
    });
  }

  validate(payload: JwtPayload): AuthUser {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
