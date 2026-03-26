import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { getPagination, getSearchTerm } from '../common/utils/list-query.util';
import { CreateAiConversationDto } from './dto/create-ai-conversation.dto';
import { UpdateAiConversationDto } from './dto/update-ai-conversation.dto';

@Injectable()
export class AiConversationsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateAiConversationDto, currentUserId: string) {
    const { user_id: _ignoredUserId, ...rest } = data;

    const prismaData: Prisma.ai_conversationsUncheckedCreateInput = {
      ...rest,
      user_id: currentUserId,
      created_at: new Date(rest.created_at),
    };

    return this.prisma.ai_conversations.create({ data: prismaData });
  }

  findAll(query: ListQueryDto, currentUserId: string) {
    const { skip, take } = getPagination(query);
    const searchTerm = getSearchTerm(query);

    return this.prisma.ai_conversations.findMany({
      skip,
      take,
      where: {
        user_id: currentUserId,
        ...(searchTerm
          ? {
              title: { contains: searchTerm, mode: 'insensitive' as const },
            }
          : {}),
      },
    });
  }

  async findOne(aiConversationId: string, currentUserId: string) {
    const conversation = await this.prisma.ai_conversations.findFirst({
      where: {
        ai_conversation_id: aiConversationId,
        user_id: currentUserId,
      },
    });

    if (!conversation) {
      throw new NotFoundException('AI conversation not found');
    }

    return conversation;
  }

  async update(
    aiConversationId: string,
    data: UpdateAiConversationDto,
    currentUserId: string,
  ) {
    await this.findOne(aiConversationId, currentUserId);

    const { created_at, user_id: _ignoredUserId, ...rest } = data;

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

  async remove(aiConversationId: string, currentUserId: string) {
    await this.findOne(aiConversationId, currentUserId);

    return this.prisma.ai_conversations.delete({
      where: { ai_conversation_id: aiConversationId },
    });
  }
}
