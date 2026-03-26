import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() data: CreateUserDto, @CurrentUser() user: AuthUser) {
    return this.usersService.create(data, user.userId, user.email);
  }

  @Get()
  findAll(@Query() query: ListQueryDto, @CurrentUser() user: AuthUser) {
    return this.usersService.findAll(query, user.userId);
  }

  @Get(':userId')
  findOne(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.usersService.findOne(userId, user.userId);
  }

  @Patch(':userId')
  update(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() data: UpdateUserDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.usersService.update(userId, data, user.userId, user.email);
  }

  @Delete(':userId')
  remove(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.usersService.remove(userId, user.userId);
  }
}
