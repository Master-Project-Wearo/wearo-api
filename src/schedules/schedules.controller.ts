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
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { SchedulesService } from './schedules.service';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  create(@Body() data: CreateScheduleDto, @CurrentUser() user: AuthUser) {
    return this.schedulesService.create(data, user.userId);
  }

  @Get()
  findAll(@Query() query: ListQueryDto, @CurrentUser() user: AuthUser) {
    return this.schedulesService.findAll(query, user.userId);
  }

  @Get(':scheduleId')
  findOne(
    @Param('scheduleId', new ParseUUIDPipe()) scheduleId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.schedulesService.findOne(scheduleId, user.userId);
  }

  @Patch(':scheduleId')
  update(
    @Param('scheduleId', new ParseUUIDPipe()) scheduleId: string,
    @Body() data: UpdateScheduleDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.schedulesService.update(scheduleId, data, user.userId);
  }

  @Delete(':scheduleId')
  remove(
    @Param('scheduleId', new ParseUUIDPipe()) scheduleId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.schedulesService.remove(scheduleId, user.userId);
  }
}
