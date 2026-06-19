import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query() query: ListQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get('me')
  findMe(@CurrentUser() user: AuthUser) {
    return this.usersService.findOne(user.userId);
  }

  @Patch('me')
  updateMe(@Body() data: UpdateUserDto, @CurrentUser() user: AuthUser) {
    return this.usersService.update(user.userId, data);
  }

  @Patch(':userId')
  update(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() data: UpdateUserDto,
  ) {
    return this.usersService.update(userId, data);
  }
}
