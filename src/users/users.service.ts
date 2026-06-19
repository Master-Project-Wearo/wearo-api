import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { getPagination, getSearchTerm } from '../common/utils/list-query.util';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: ListQueryDto) {
    const { skip, take } = getPagination(query);
    const searchTerm = getSearchTerm(query);

    const searchFilter = searchTerm
      ? {
          OR: [
            {
              firstname: { contains: searchTerm, mode: 'insensitive' as const },
            },
            {
              lastname: { contains: searchTerm, mode: 'insensitive' as const },
            },
            { email: { contains: searchTerm, mode: 'insensitive' as const } },
          ],
        }
      : undefined;

    return this.prisma.users.findMany({
      skip,
      take,
      where: searchFilter,
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(userId: string, data: UpdateUserDto) {
    await this.findOne(userId);

    return this.prisma.users.update({
      where: { user_id: userId },
      data,
    });
  }
}
