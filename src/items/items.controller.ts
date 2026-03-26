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
import { ListQueryDto } from '../common/dto/list-query.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { ItemsService } from './items.service';
import { UpdateItemDto } from './dto/update-item.dto';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  create(@Body() data: CreateItemDto) {
    return this.itemsService.create(data);
  }

  @Get()
  findAll(@Query() query: ListQueryDto) {
    return this.itemsService.findAll(query);
  }

  @Get(':itemId')
  findOne(@Param('itemId', new ParseUUIDPipe()) itemId: string) {
    return this.itemsService.findOne(itemId);
  }

  @Patch(':itemId')
  update(
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
    @Body() data: UpdateItemDto,
  ) {
    return this.itemsService.update(itemId, data);
  }

  @Delete(':itemId')
  remove(@Param('itemId', new ParseUUIDPipe()) itemId: string) {
    return this.itemsService.remove(itemId);
  }
}
