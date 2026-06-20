import { Body, Controller, Get, Patch } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  findMe(@CurrentUser() user: AuthUser) {
    return this.usersService.findOne(user.userId);
  }

  @Patch('me')
  updateMe(@Body() data: UpdateUserDto, @CurrentUser() user: AuthUser) {
    return this.usersService.update(user.userId, data);
  }
}
