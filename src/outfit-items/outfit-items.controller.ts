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
import { CreateOutfitItemDto } from './dto/create-outfit-item.dto';
import { OutfitItemsService } from './outfit-items.service';
import { UpdateOutfitItemDto } from './dto/update-outfit-item.dto';

@Controller('outfit-items')
export class OutfitItemsController {
  constructor(private readonly outfitItemsService: OutfitItemsService) {}

  @Post()
  create(@Body() data: CreateOutfitItemDto, @CurrentUser() user: AuthUser) {
    return this.outfitItemsService.create(data, user.userId);
  }

  @Get()
  findAll(@Query() query: ListQueryDto, @CurrentUser() user: AuthUser) {
    return this.outfitItemsService.findAll(query, user.userId);
  }

  @Get(':outfitId/:itemId')
  findOne(
    @Param('outfitId', new ParseUUIDPipe()) outfitId: string,
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.outfitItemsService.findOne(outfitId, itemId, user.userId);
  }

  @Patch(':outfitId/:itemId')
  update(
    @Param('outfitId', new ParseUUIDPipe()) outfitId: string,
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
    @Body() data: UpdateOutfitItemDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.outfitItemsService.update(outfitId, itemId, data, user.userId);
  }

  @Delete(':outfitId/:itemId')
  remove(
    @Param('outfitId', new ParseUUIDPipe()) outfitId: string,
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.outfitItemsService.remove(outfitId, itemId, user.userId);
  }
}
