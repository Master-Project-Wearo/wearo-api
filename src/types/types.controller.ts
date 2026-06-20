import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { TypesService } from './types.service';

@Controller('types')
export class TypesController {
  constructor(private readonly typesService: TypesService) {}

  @Get()
  findAll(@Query() query: ListQueryDto) {
    return this.typesService.findAll(query);
  }

  @Get(':typeId')
  findOne(@Param('typeId', new ParseUUIDPipe()) typeId: string) {
    return this.typesService.findOne(typeId);
  }
}
