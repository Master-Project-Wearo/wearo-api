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
import { CreateItemDto } from './dto/create-item.dto';
import { ItemsService } from './items.service';
import { UpdateItemDto } from './dto/update-item.dto';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  create(@Body() data: CreateItemDto, @CurrentUser() user: AuthUser) {
    return this.itemsService.create(data, user.userId);
  }

  @Get()
  findAll(@Query() query: ListQueryDto, @CurrentUser() user: AuthUser) {
    return this.itemsService.findAll(query, user.userId);
  }

  @Get(':itemId')
  findOne(
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.itemsService.findOne(itemId, user.userId);
  }

  @Patch(':itemId')
  update(
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
    @Body() data: UpdateItemDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.itemsService.update(itemId, data, user.userId);
  }

  @Delete(':itemId')
  remove(
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.itemsService.remove(itemId, user.userId);
  }
}
