import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAiMessageDto } from './dto/create-ai-message.dto';
import { UpdateAiMessageDto } from './dto/update-ai-message.dto';

@Injectable()
export class AiMessagesService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateAiMessageDto) {
    const prismaData: Prisma.ai_messagesUncheckedCreateInput = {
      ...data,
      created_at: new Date(data.created_at),
    };

    return this.prisma.ai_messages.create({ data: prismaData });
  }

  findAll() {
    return this.prisma.ai_messages.findMany();
  }

  findOne(aiMessageId: string) {
    return this.prisma.ai_messages.findUnique({
      where: { ai_message_id: aiMessageId },
    });
  }

  update(aiMessageId: string, data: UpdateAiMessageDto) {
    const { created_at, ...rest } = data;

    const prismaData: Prisma.ai_messagesUncheckedUpdateInput = {
      ...rest,
      ...(created_at !== undefined
        ? {
            created_at: new Date(created_at),
          }
        : {}),
    };

    return this.prisma.ai_messages.update({
      where: { ai_message_id: aiMessageId },
      data: prismaData,
    });
  }

  remove(aiMessageId: string) {
    return this.prisma.ai_messages.delete({
      where: { ai_message_id: aiMessageId },
    });
  }
}
