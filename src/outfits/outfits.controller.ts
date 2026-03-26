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
import { CreateOutfitDto } from './dto/create-outfit.dto';
import { UpdateOutfitDto } from './dto/update-outfit.dto';
import { OutfitsService } from './outfits.service';

@Controller('outfits')
export class OutfitsController {
  constructor(private readonly outfitsService: OutfitsService) {}

  @Post()
  create(@Body() data: CreateOutfitDto) {
    return this.outfitsService.create(data);
  }

  @Get()
  findAll() {
    return this.outfitsService.findAll();
  }

  @Get(':outfitId')
  findOne(@Param('outfitId', new ParseUUIDPipe()) outfitId: string) {
    return this.outfitsService.findOne(outfitId);
  }

  @Patch(':outfitId')
  update(
    @Param('outfitId', new ParseUUIDPipe()) outfitId: string,
    @Body() data: UpdateOutfitDto,
  ) {
    return this.outfitsService.update(outfitId, data);
  }

  @Delete(':outfitId')
  remove(@Param('outfitId', new ParseUUIDPipe()) outfitId: string) {
    return this.outfitsService.remove(outfitId);
  }
}
