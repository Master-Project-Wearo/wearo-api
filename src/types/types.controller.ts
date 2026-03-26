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
  findAll(@Query() query: ListQueryDto) {
    return this.typesService.findAll(query);
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
