import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { getPagination, getSearchTerm } from '../common/utils/list-query.util';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(
    data: CreateUserDto,
    currentUserId: string,
    currentUserEmail?: string,
  ) {
    const email = currentUserEmail ?? data.email;

    const createData: Prisma.usersUncheckedCreateInput = {
      user_id: currentUserId,
      ...data,
      email,
      created_at: new Date(),
    };

    const updateData: Prisma.usersUncheckedUpdateInput = {
      ...data,
      email,
    };

    return this.prisma.users.upsert({
      where: { user_id: currentUserId },
      create: createData,
      update: updateData,
    });
  }

  findAll(query: ListQueryDto, currentUserId: string) {
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
      where: {
        user_id: currentUserId,
        ...(searchFilter ? searchFilter : {}),
      },
    });
  }

  async findOne(userId: string, currentUserId: string) {
    if (userId !== currentUserId) {
      throw new ForbiddenException('You can only access your own user profile');
    }

    const user = await this.prisma.users.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  update(
    userId: string,
    data: UpdateUserDto,
    currentUserId: string,
    currentUserEmail?: string,
  ) {
    if (userId !== currentUserId) {
      throw new ForbiddenException('You can only update your own user profile');
    }

    const { email, ...rest } = data;

    const prismaData: Prisma.usersUncheckedUpdateInput = {
      ...rest,
      ...(currentUserEmail !== undefined
        ? {
            email: currentUserEmail,
          }
        : email !== undefined
          ? {
              email,
            }
          : {}),
    };

    return this.prisma.users.update({
      where: { user_id: userId },
      data: prismaData,
    });
  }

  async remove(userId: string, currentUserId: string) {
    if (userId !== currentUserId) {
      throw new ForbiddenException('You can only delete your own account');
    }

    const user = await this.findOne(userId, currentUserId);

    // Supabase owns auth.users; its foreign key cascades to the public profile.
    await this.prisma.$executeRaw`
      DELETE FROM auth.users
      WHERE id = ${userId}::uuid
    `;

    return user;
  }
}
