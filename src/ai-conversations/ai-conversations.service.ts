import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { getPagination, getSearchTerm } from '../common/utils/list-query.util';
import { CreateAiConversationDto } from './dto/create-ai-conversation.dto';
import { UpdateAiConversationDto } from './dto/update-ai-conversation.dto';

@Injectable()
export class AiConversationsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateAiConversationDto) {
    const prismaData: Prisma.ai_conversationsUncheckedCreateInput = {
      ...data,
      created_at: new Date(data.created_at),
    };

    return this.prisma.ai_conversations.create({ data: prismaData });
  }

  findAll(query: ListQueryDto) {
    const { skip, take } = getPagination(query);
    const searchTerm = getSearchTerm(query);

    return this.prisma.ai_conversations.findMany({
      skip,
      take,
      ...(searchTerm
        ? {
            where: {
              title: { contains: searchTerm, mode: 'insensitive' },
            },
          }
        : {}),
    });
  }

  findOne(aiConversationId: string) {
    return this.prisma.ai_conversations.findUnique({
      where: { ai_conversation_id: aiConversationId },
    });
  }

  update(aiConversationId: string, data: UpdateAiConversationDto) {
    const { created_at, ...rest } = data;

    const prismaData: Prisma.ai_conversationsUncheckedUpdateInput = {
      ...rest,
      ...(created_at !== undefined
        ? {
            created_at: new Date(created_at),
          }
        : {}),
    };

    return this.prisma.ai_conversations.update({
      where: { ai_conversation_id: aiConversationId },
      data: prismaData,
    });
  }

  remove(aiConversationId: string) {
    return this.prisma.ai_conversations.delete({
      where: { ai_conversation_id: aiConversationId },
    });
  }
}
