import { Body, Controller, Get, Patch, Req } from '@nestjs/common';
import { Request } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

type RequestWithAuthorizationHeader = Request & {
  headers: Request['headers'] & {
    authorization?: string;
  };
};

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  findMe(@CurrentUser() user: AuthUser) {
    return this.usersService.findOne(user.userId);
  }

  @Patch('me')
  updateMe(
    @Body() data: UpdateUserDto,
    @CurrentUser() user: AuthUser,
    @Req() request: RequestWithAuthorizationHeader,
  ) {
    return this.usersService.update(
      user.userId,
      data,
      request.headers.authorization,
    );
  }
}
