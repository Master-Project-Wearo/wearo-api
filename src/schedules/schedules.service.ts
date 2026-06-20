import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { getPagination } from '../common/utils/list-query.util';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertOutfitOwnership(outfitId: string, currentUserId: string) {
    const outfit = await this.prisma.outfits.findFirst({
      where: { outfit_id: outfitId, user_id: currentUserId },
      select: { outfit_id: true },
    });

    if (!outfit) {
      throw new NotFoundException('Outfit not found');
    }
  }

  create(data: CreateScheduleDto, currentUserId: string) {
    return this.createOwnedSchedule(data, currentUserId);
  }

  private async createOwnedSchedule(
    data: CreateScheduleDto,
    currentUserId: string,
  ) {
    await this.assertOutfitOwnership(data.outfit_id, currentUserId);

    const prismaData: Prisma.schedulesUncheckedCreateInput = {
      ...data,
      user_id: currentUserId,
      planned_for: new Date(data.planned_for),
    };

    return this.prisma.schedules.create({ data: prismaData });
  }

  findAll(query: ListQueryDto, currentUserId: string) {
    const { skip, take } = getPagination(query);

    return this.prisma.schedules.findMany({
      skip,
      take,
      where: { user_id: currentUserId },
      orderBy: [{ planned_for: 'asc' }, { schedule_id: 'asc' }],
    });
  }

  async findOne(scheduleId: string, currentUserId: string) {
    const schedule = await this.prisma.schedules.findFirst({
      where: { schedule_id: scheduleId, user_id: currentUserId },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return schedule;
  }

  async update(
    scheduleId: string,
    data: UpdateScheduleDto,
    currentUserId: string,
  ) {
    const { planned_for, outfit_id, ...rest } = data;

    if (outfit_id !== undefined) {
      await this.assertOutfitOwnership(outfit_id, currentUserId);
    }

    const prismaData: Prisma.schedulesUncheckedUpdateInput = {
      ...rest,
      ...(outfit_id !== undefined ? { outfit_id } : {}),
      ...(planned_for !== undefined
        ? {
            planned_for: new Date(planned_for),
          }
        : {}),
    };

    return this.prisma.schedules.update({
      where: { schedule_id: scheduleId, user_id: currentUserId },
      data: prismaData,
    });
  }

  async remove(scheduleId: string, currentUserId: string) {
    return this.prisma.schedules.delete({
      where: { schedule_id: scheduleId, user_id: currentUserId },
    });
  }
}
