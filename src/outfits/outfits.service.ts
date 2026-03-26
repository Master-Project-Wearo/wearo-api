import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { getPagination, getSearchTerm } from '../common/utils/list-query.util';
import { CreateOutfitDto } from './dto/create-outfit.dto';
import { UpdateOutfitDto } from './dto/update-outfit.dto';

@Injectable()
export class OutfitsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateOutfitDto) {
    const prismaData: Prisma.outfitsUncheckedCreateInput = {
      ...data,
      created_at: new Date(data.created_at),
    };

    return this.prisma.outfits.create({ data: prismaData });
  }

  findAll(query: ListQueryDto) {
    const { skip, take } = getPagination(query);
    const searchTerm = getSearchTerm(query);

    return this.prisma.outfits.findMany({
      skip,
      take,
      ...(searchTerm
        ? {
            where: {
              OR: [
                { name: { contains: searchTerm, mode: 'insensitive' } },
                { theme: { contains: searchTerm, mode: 'insensitive' } },
              ],
            },
          }
        : {}),
    });
  }

  findOne(outfitId: string) {
    return this.prisma.outfits.findUnique({
      where: { outfit_id: outfitId },
    });
  }

  update(outfitId: string, data: UpdateOutfitDto) {
    const { created_at, ...rest } = data;

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

  remove(outfitId: string) {
    return this.prisma.outfits.delete({
      where: { outfit_id: outfitId },
    });
  }
}
