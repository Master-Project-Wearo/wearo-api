import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { getPagination } from '../common/utils/list-query.util';
import { CreateOutfitItemDto } from './dto/create-outfit-item.dto';
import { UpdateOutfitItemDto } from './dto/update-outfit-item.dto';

@Injectable()
export class OutfitItemsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateOutfitItemDto) {
    const prismaData: Prisma.outfit_itemsUncheckedCreateInput = {
      ...data,
    };

    return this.prisma.outfit_items.create({ data: prismaData });
  }

  findAll(query: ListQueryDto) {
    const { skip, take } = getPagination(query);

    return this.prisma.outfit_items.findMany({
      skip,
      take,
    });
  }

  findOne(outfitId: string, itemId: string) {
    return this.prisma.outfit_items.findUnique({
      where: {
        outfit_id_item_id: {
          outfit_id: outfitId,
          item_id: itemId,
        },
      },
    });
  }

  update(outfitId: string, itemId: string, data: UpdateOutfitItemDto) {
    const prismaData: Prisma.outfit_itemsUncheckedUpdateInput = {
      ...data,
    };

    return this.prisma.outfit_items.update({
      where: {
        outfit_id_item_id: {
          outfit_id: outfitId,
          item_id: itemId,
        },
      },
      data: prismaData,
    });
  }

  remove(outfitId: string, itemId: string) {
    return this.prisma.outfit_items.delete({
      where: {
        outfit_id_item_id: {
          outfit_id: outfitId,
          item_id: itemId,
        },
      },
    });
  }
}
