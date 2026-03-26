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
import { CreateOutfitDto } from './dto/create-outfit.dto';
import { UpdateOutfitDto } from './dto/update-outfit.dto';
import { OutfitsService } from './outfits.service';

@Controller('outfits')
export class OutfitsController {
  constructor(private readonly outfitsService: OutfitsService) {}

  @Post()
  create(@Body() data: CreateOutfitDto, @CurrentUser() user: AuthUser) {
    return this.outfitsService.create(data, user.userId);
  }

  @Get()
  findAll(@Query() query: ListQueryDto, @CurrentUser() user: AuthUser) {
    return this.outfitsService.findAll(query, user.userId);
  }

  @Get(':outfitId')
  findOne(
    @Param('outfitId', new ParseUUIDPipe()) outfitId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.outfitsService.findOne(outfitId, user.userId);
  }

  @Patch(':outfitId')
  update(
    @Param('outfitId', new ParseUUIDPipe()) outfitId: string,
    @Body() data: UpdateOutfitDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.outfitsService.update(outfitId, data, user.userId);
  }

  @Delete(':outfitId')
  remove(
    @Param('outfitId', new ParseUUIDPipe()) outfitId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.outfitsService.remove(outfitId, user.userId);
  }
}
