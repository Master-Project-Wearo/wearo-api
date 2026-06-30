import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { SupabaseAuthService } from './supabase-auth.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseAuth: SupabaseAuthService,
  ) {}

  async findOne(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(userId: string, data: UpdateUserDto, authorization?: string) {
    await this.findOne(userId);

    const { nickname, ...publicUserData } = data;

    if (nickname !== undefined) {
      await this.supabaseAuth.updateNickname(authorization, nickname);
    }

    if (!Object.keys(publicUserData).length) {
      return this.findOne(userId);
    }

    return this.prisma.users.update({
      where: { user_id: userId },
      data: publicUserData,
    });
  }
}
