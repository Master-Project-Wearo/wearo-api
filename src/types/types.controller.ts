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
import { CreateTypeDto } from './dto/create-type.dto';
import { UpdateTypeDto } from './dto/update-type.dto';
import { TypesService } from './types.service';

@Controller('types')
export class TypesController {
  constructor(private readonly typesService: TypesService) {}

  @Post()
  create(@Body() data: CreateTypeDto) {
    return this.typesService.create(data);
  }

  @Get()
  findAll() {
    return this.typesService.findAll();
  }

  @Get(':typeId')
  findOne(@Param('typeId', new ParseUUIDPipe()) typeId: string) {
    return this.typesService.findOne(typeId);
  }

  @Patch(':typeId')
  update(
    @Param('typeId', new ParseUUIDPipe()) typeId: string,
    @Body() data: UpdateTypeDto,
  ) {
    return this.typesService.update(typeId, data);
  }

  @Delete(':typeId')
  remove(@Param('typeId', new ParseUUIDPipe()) typeId: string) {
    return this.typesService.remove(typeId);
  }
}
