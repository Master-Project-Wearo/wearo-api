import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { PrismaModule } from './prisma/prisma.module';
import { ItemsModule } from './items/items.module';
import { AiConversationsModule } from './ai-conversations/ai-conversations.module';
import { AiMessagesModule } from './ai-messages/ai-messages.module';
import { OutfitsModule } from './outfits/outfits.module';
import { SchedulesModule } from './schedules/schedules.module';
import { TypesModule } from './types/types.module';
import { UsersModule } from './users/users.module';
import { OutfitItemsModule } from './outfit-items/outfit-items.module';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 120,
      },
    ]),
    AuthModule,
    PrismaModule,
    ItemsModule,
    AiConversationsModule,
    AiMessagesModule,
    OutfitsModule,
    SchedulesModule,
    TypesModule,
    UsersModule,
    OutfitItemsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
  ],
})
export class AppModule {}
