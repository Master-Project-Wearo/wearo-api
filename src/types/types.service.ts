import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTypeDto } from './dto/create-type.dto';
import { UpdateTypeDto } from './dto/update-type.dto';

@Injectable()
export class TypesService {
	constructor(private readonly prisma: PrismaService) {}

	create(data: CreateTypeDto) {
		const prismaData: Prisma.typesUncheckedCreateInput = {
			...data,
		};

		return this.prisma.types.create({ data: prismaData });
	}

	findAll() {
		return this.prisma.types.findMany();
	}

	findOne(typeId: string) {
		return this.prisma.types.findUnique({
			where: { type_id: typeId },
		});
	}

	update(typeId: string, data: UpdateTypeDto) {
		const prismaData: Prisma.typesUncheckedUpdateInput = {
			...data,
		};

		return this.prisma.types.update({
			where: { type_id: typeId },
			data: prismaData,
		});
	}

	remove(typeId: string) {
		return this.prisma.types.delete({
			where: { type_id: typeId },
		});
	}
}
