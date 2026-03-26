import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateUserDto) {
    const prismaData: Prisma.usersUncheckedCreateInput = {
      ...data,
      date_of_birth: new Date(data.date_of_birth),
    };

    return this.prisma.users.create({ data: prismaData });
  }

  findAll() {
    return this.prisma.users.findMany();
  }

  findOne(userId: string) {
    return this.prisma.users.findUnique({
      where: { user_id: userId },
    });
  }

  update(userId: string, data: UpdateUserDto) {
    const { date_of_birth, ...rest } = data;

    const prismaData: Prisma.usersUncheckedUpdateInput = {
      ...rest,
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

  remove(userId: string) {
    return this.prisma.users.delete({
      where: { user_id: userId },
    });
  }
}
