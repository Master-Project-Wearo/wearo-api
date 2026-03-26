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
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { SchedulesService } from './schedules.service';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  create(@Body() data: CreateScheduleDto) {
    return this.schedulesService.create(data);
  }

  @Get()
  findAll(@Query() query: ListQueryDto) {
    return this.schedulesService.findAll(query);
  }

  @Get(':scheduleId')
  findOne(@Param('scheduleId', new ParseUUIDPipe()) scheduleId: string) {
    return this.schedulesService.findOne(scheduleId);
  }

  @Patch(':scheduleId')
  update(
    @Param('scheduleId', new ParseUUIDPipe()) scheduleId: string,
    @Body() data: UpdateScheduleDto,
  ) {
    return this.schedulesService.update(scheduleId, data);
  }

  @Delete(':scheduleId')
  remove(@Param('scheduleId', new ParseUUIDPipe()) scheduleId: string) {
    return this.schedulesService.remove(scheduleId);
  }
}
