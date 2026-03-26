import { Module } from '@nestjs/common';
import { AiMessagesService } from './ai-messages.service';
import { AiMessagesController } from './ai-messages.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AiMessagesService],
  controllers: [AiMessagesController],
})
export class AiMessagesModule {}
