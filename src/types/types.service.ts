import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { getPagination, getSearchTerm } from '../common/utils/list-query.util';
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

  findAll(query: ListQueryDto) {
    const { skip, take } = getPagination(query);
    const searchTerm = getSearchTerm(query);

    return this.prisma.types.findMany({
      skip,
      take,
      ...(searchTerm
        ? {
            where: {
              OR: [
                { name: { contains: searchTerm, mode: 'insensitive' } },
                {
                  description: {
                    contains: searchTerm,
                    mode: 'insensitive',
                  },
                },
              ],
            },
          }
        : {}),
    });
  }

  async findOne(typeId: string) {
    const type = await this.prisma.types.findUnique({
      where: { type_id: typeId },
    });

    if (!type) {
      throw new NotFoundException('Type not found');
    }

    return type;
  }

  async update(typeId: string, data: UpdateTypeDto) {
    await this.findOne(typeId);

    const prismaData: Prisma.typesUncheckedUpdateInput = {
      ...data,
    };

    return this.prisma.types.update({
      where: { type_id: typeId },
      data: prismaData,
    });
  }

  async remove(typeId: string) {
    await this.findOne(typeId);

    return this.prisma.types.delete({
      where: { type_id: typeId },
    });
  }
}
