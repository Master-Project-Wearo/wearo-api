import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TEST_JWT_SECRET } from '../constants';
import { AuthUser } from '../interfaces/auth-user.interface';
import { passportJwtSecret } from 'jwks-rsa';

type JwtPayload = {
  sub?: string;
  aud?: string | string[];
  email?: string;
  role?: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const isTest = process.env.NODE_ENV === 'test';
    const supabaseUrl = process.env.SUPABASE_URL;

    if (!isTest && !supabaseUrl) {
      throw new Error('SUPABASE_URL must be set in production/development');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      audience: 'authenticated',
      ...(isTest
        ? {
            secretOrKey: TEST_JWT_SECRET,
            algorithms: ['HS256'],
          }
        : {
            secretOrKeyProvider: passportJwtSecret({
              cache: true,
              rateLimit: true,
              jwksRequestsPerMinute: 5,
              jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
            }),
            algorithms: ['ES256'],
          }),
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
