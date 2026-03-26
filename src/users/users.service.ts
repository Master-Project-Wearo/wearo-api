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
      date_of_birth: new Date(data.date_of_birth),
    };

    const updateData: Prisma.usersUncheckedUpdateInput = {
      ...data,
      email,
      date_of_birth: new Date(data.date_of_birth),
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

    const { date_of_birth, email, ...rest } = data;

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
      ...(date_of_birth !== undefined
        ? {
            date_of_birth: new Date(date_of_birth),
          }
        : {}),
    };

    return this.prisma.users.update({
      where: { user_id: userId },
      data: prismaData,
    });
  }

  remove(userId: string, currentUserId: string) {
    if (userId !== currentUserId) {
      throw new ForbiddenException('You can only delete your own user profile');
    }

    return this.prisma.users.delete({
      where: { user_id: userId },
    });
  }
}
