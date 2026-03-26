import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { getPagination, getSearchTerm } from '../common/utils/list-query.util';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateItemDto) {
    const { ai_attributes, added_at, ...rest } = data;

    const prismaData: Prisma.itemsUncheckedCreateInput = {
      ...rest,
      added_at: new Date(added_at),
      ...(ai_attributes !== undefined
        ? {
            ai_attributes: ai_attributes as Prisma.InputJsonValue,
          }
        : {}),
    };

    return this.prisma.items.create({
      data: prismaData,
    });
  }

  findAll(query: ListQueryDto) {
    const { skip, take } = getPagination(query);
    const searchTerm = getSearchTerm(query);

    return this.prisma.items.findMany({
      skip,
      take,
      ...(searchTerm
        ? {
            where: {
              OR: [
                { name: { contains: searchTerm, mode: 'insensitive' } },
                { brand: { contains: searchTerm, mode: 'insensitive' } },
                {
                  ai_description: {
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

  findOne(itemId: string) {
    return this.prisma.items.findUnique({
      where: { item_id: itemId },
    });
  }

  update(itemId: string, data: UpdateItemDto) {
    const { ai_attributes, ...rest } = data;

    const prismaData: Prisma.itemsUncheckedUpdateInput = {
      ...rest,
      ...(ai_attributes !== undefined
        ? {
            ai_attributes: ai_attributes as Prisma.InputJsonValue,
          }
        : {}),
    };

    return this.prisma.items.update({
      where: { item_id: itemId },
      data: prismaData,
    });
  }

  remove(itemId: string) {
    return this.prisma.items.delete({
      where: { item_id: itemId },
    });
  }
}
