import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SupabaseAuthService } from './supabase-auth.service';

@Module({
  imports: [PrismaModule],
  providers: [UsersService, SupabaseAuthService],
  controllers: [UsersController],
})
export class UsersModule {}
