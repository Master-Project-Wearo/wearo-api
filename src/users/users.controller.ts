import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() data: CreateUserDto) {
    return this.usersService.create(data);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':userId')
  findOne(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.usersService.findOne(userId);
  }

  @Patch(':userId')
  update(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() data: UpdateUserDto,
  ) {
    return this.usersService.update(userId, data);
  }

  @Delete(':userId')
  remove(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.usersService.remove(userId);
  }
}
