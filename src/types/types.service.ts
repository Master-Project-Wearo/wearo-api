import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { getPagination, getSearchTerm } from '../common/utils/list-query.util';

@Injectable()
export class TypesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: ListQueryDto) {
    const { skip, take } = getPagination(query);
    const searchTerm = getSearchTerm(query);

    return this.prisma.types.findMany({
      skip,
      take,
      orderBy: [{ name: 'asc' }, { type_id: 'asc' }],
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
}
