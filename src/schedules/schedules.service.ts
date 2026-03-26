import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class SchedulesService {
	constructor(private readonly prisma: PrismaService) {}

	create(data: CreateScheduleDto) {
		const prismaData: Prisma.schedulesUncheckedCreateInput = {
			...data,
			planned_for: new Date(data.planned_for),
			created_at: new Date(data.created_at),
		};

		return this.prisma.schedules.create({ data: prismaData });
	}

	findAll() {
		return this.prisma.schedules.findMany();
	}

	findOne(scheduleId: string) {
		return this.prisma.schedules.findUnique({
			where: { schedule_id: scheduleId },
		});
	}

	update(scheduleId: string, data: UpdateScheduleDto) {
		const { planned_for, created_at, ...rest } = data;

		const prismaData: Prisma.schedulesUncheckedUpdateInput = {
			...rest,
			...(planned_for !== undefined
				? {
						planned_for: new Date(planned_for),
					}
				: {}),
			...(created_at !== undefined
				? {
						created_at: new Date(created_at),
					}
				: {}),
		};

		return this.prisma.schedules.update({
			where: { schedule_id: scheduleId },
			data: prismaData,
		});
	}

	remove(scheduleId: string) {
		return this.prisma.schedules.delete({
			where: { schedule_id: scheduleId },
		});
	}
}
