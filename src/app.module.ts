import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ItemsModule } from './items/items.module';
import { AiConversationsModule } from './ai-conversations/ai-conversations.module';
import { AiMessagesModule } from './ai-messages/ai-messages.module';
import { OutfitsModule } from './outfits/outfits.module';
import { SchedulesModule } from './schedules/schedules.module';
import { TypesModule } from './types/types.module';
import { UsersModule } from './users/users.module';
import { OutfitItemsModule } from './outfit-items/outfit-items.module';

@Module({
  imports: [PrismaModule, ItemsModule, AiConversationsModule, AiMessagesModule, OutfitsModule, SchedulesModule, TypesModule, UsersModule, OutfitItemsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
