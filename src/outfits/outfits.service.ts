import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { getPagination, getSearchTerm } from '../common/utils/list-query.util';
import { CreateOutfitDto } from './dto/create-outfit.dto';
import { UpdateOutfitDto } from './dto/update-outfit.dto';

@Injectable()
export class OutfitsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateOutfitDto, currentUserId: string) {
    const { user_id: _ignoredUserId, ...rest } = data;

    const prismaData: Prisma.outfitsUncheckedCreateInput = {
      ...rest,
      user_id: currentUserId,
      created_at: new Date(rest.created_at),
    };

    return this.prisma.outfits.create({ data: prismaData });
  }

  findAll(query: ListQueryDto, currentUserId: string) {
    const { skip, take } = getPagination(query);
    const searchTerm = getSearchTerm(query);

    const searchFilter = searchTerm
      ? {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' as const } },
            { theme: { contains: searchTerm, mode: 'insensitive' as const } },
          ],
        }
      : undefined;

    return this.prisma.outfits.findMany({
      skip,
      take,
      where: {
        user_id: currentUserId,
        ...(searchFilter ? searchFilter : {}),
      },
    });
  }

  async findOne(outfitId: string, currentUserId: string) {
    const outfit = await this.prisma.outfits.findFirst({
      where: { outfit_id: outfitId, user_id: currentUserId },
    });

    if (!outfit) {
      throw new NotFoundException('Outfit not found');
    }

    return outfit;
  }

  async update(outfitId: string, data: UpdateOutfitDto, currentUserId: string) {
    await this.findOne(outfitId, currentUserId);

    const { created_at, user_id: _ignoredUserId, ...rest } = data;

    const prismaData: Prisma.outfitsUncheckedUpdateInput = {
      ...rest,
      ...(created_at !== undefined
        ? {
            created_at: new Date(created_at),
          }
        : {}),
    };

    return this.prisma.outfits.update({
      where: { outfit_id: outfitId },
      data: prismaData,
    });
  }

  async remove(outfitId: string, currentUserId: string) {
    await this.findOne(outfitId, currentUserId);

    return this.prisma.outfits.delete({
      where: { outfit_id: outfitId },
    });
  }
}
