import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { getPagination } from '../common/utils/list-query.util';
import { CreateOutfitItemDto } from './dto/create-outfit-item.dto';
import { UpdateOutfitItemDto } from './dto/update-outfit-item.dto';

@Injectable()
export class OutfitItemsService {
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

  private async assertItemOwnership(itemId: string, currentUserId: string) {
    const item = await this.prisma.items.findFirst({
      where: { item_id: itemId, user_id: currentUserId },
      select: { item_id: true },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }
  }

  async create(data: CreateOutfitItemDto, currentUserId: string) {
    await this.assertOutfitOwnership(data.outfit_id, currentUserId);
    await this.assertItemOwnership(data.item_id, currentUserId);

    const prismaData: Prisma.outfit_itemsUncheckedCreateInput = {
      ...data,
    };

    return this.prisma.outfit_items.create({ data: prismaData });
  }

  findAll(query: ListQueryDto, currentUserId: string) {
    const { skip, take } = getPagination(query);

    return this.prisma.outfit_items.findMany({
      skip,
      take,
      orderBy: [{ outfit_id: 'asc' }, { item_id: 'asc' }],
      where: {
        outfits: { user_id: currentUserId },
        items: { user_id: currentUserId },
      },
    });
  }

  async findOne(outfitId: string, itemId: string, currentUserId: string) {
    const outfitItem = await this.prisma.outfit_items.findFirst({
      where: {
        outfit_id: outfitId,
        item_id: itemId,
        outfits: { user_id: currentUserId },
        items: { user_id: currentUserId },
      },
    });

    if (!outfitItem) {
      throw new NotFoundException('Outfit item not found');
    }

    return outfitItem;
  }

  async update(
    outfitId: string,
    itemId: string,
    data: UpdateOutfitItemDto,
    currentUserId: string,
  ) {
    const nextOutfitId = data.outfit_id ?? outfitId;
    const nextItemId = data.item_id ?? itemId;

    await this.assertOutfitOwnership(nextOutfitId, currentUserId);
    await this.assertItemOwnership(nextItemId, currentUserId);

    const prismaData: Prisma.outfit_itemsUncheckedUpdateInput = {
      outfit_id: nextOutfitId,
      item_id: nextItemId,
    };

    return this.prisma.outfit_items.update({
      where: {
        outfit_id_item_id: {
          outfit_id: outfitId,
          item_id: itemId,
        },
        outfits: { user_id: currentUserId },
        items: { user_id: currentUserId },
      },
      data: prismaData,
    });
  }

  async remove(outfitId: string, itemId: string, currentUserId: string) {
    return this.prisma.outfit_items.delete({
      where: {
        outfit_id_item_id: {
          outfit_id: outfitId,
          item_id: itemId,
        },
        outfits: { user_id: currentUserId },
        items: { user_id: currentUserId },
      },
    });
  }
}
