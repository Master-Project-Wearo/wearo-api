import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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
