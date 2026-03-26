import { Module } from '@nestjs/common';
import { AiConversationsService } from './ai-conversations.service';
import { AiConversationsController } from './ai-conversations.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AiConversationsService],
  controllers: [AiConversationsController],
})
export class AiConversationsModule {}
