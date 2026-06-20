import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { getPagination, getSearchTerm } from '../common/utils/list-query.util';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateItemDto, currentUserId: string) {
    const { ai_attributes, ...rest } = data;

    const prismaData: Prisma.itemsUncheckedCreateInput = {
      ...rest,
      user_id: currentUserId,
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

  findAll(query: ListQueryDto, currentUserId: string) {
    const { skip, take } = getPagination(query);
    const searchTerm = getSearchTerm(query);

    const searchFilter = searchTerm
      ? {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' as const } },
            { brand: { contains: searchTerm, mode: 'insensitive' as const } },
            {
              ai_description: {
                contains: searchTerm,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : undefined;

    return this.prisma.items.findMany({
      skip,
      take,
      orderBy: [{ added_at: 'desc' }, { item_id: 'desc' }],
      where: {
        user_id: currentUserId,
        ...(searchFilter ? searchFilter : {}),
      },
    });
  }

  async findOne(itemId: string, currentUserId: string) {
    const item = await this.prisma.items.findFirst({
      where: { item_id: itemId, user_id: currentUserId },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return item;
  }

  async update(itemId: string, data: UpdateItemDto, currentUserId: string) {
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
      where: { item_id: itemId, user_id: currentUserId },
      data: prismaData,
    });
  }

  async remove(itemId: string, currentUserId: string) {
    return this.prisma.items.delete({
      where: { item_id: itemId, user_id: currentUserId },
    });
  }
}
