import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { Public } from './decorators/public.decorator';
import { AuthUser } from './interfaces/auth-user.interface';

type AuthenticatedRequest = Request & { user: AuthUser };

@Controller('auth')
export class AuthController {
  @Public()
  @Get('health')
  health() {
    return { ok: true };
  }

  @Get('me')
  me(@Req() request: AuthenticatedRequest) {
    return request.user;
  }
}
