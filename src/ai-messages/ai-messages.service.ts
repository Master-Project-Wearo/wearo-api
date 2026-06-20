import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { getPagination, getSearchTerm } from '../common/utils/list-query.util';
import { CreateAiMessageDto } from './dto/create-ai-message.dto';
import { UpdateAiMessageDto } from './dto/update-ai-message.dto';

@Injectable()
export class AiMessagesService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertConversationOwnership(
    aiConversationId: string,
    currentUserId: string,
  ) {
    const conversation = await this.prisma.ai_conversations.findFirst({
      where: {
        ai_conversation_id: aiConversationId,
        user_id: currentUserId,
      },
      select: { ai_conversation_id: true },
    });

    if (!conversation) {
      throw new NotFoundException('AI conversation not found');
    }
  }

  private async assertOutfitOwnership(outfitId: string, currentUserId: string) {
    const outfit = await this.prisma.outfits.findFirst({
      where: { outfit_id: outfitId, user_id: currentUserId },
      select: { outfit_id: true },
    });

    if (!outfit) {
      throw new NotFoundException('Outfit not found');
    }
  }

  async create(data: CreateAiMessageDto, currentUserId: string) {
    await this.assertConversationOwnership(
      data.ai_conversation_id,
      currentUserId,
    );

    if (data.outfit_id) {
      await this.assertOutfitOwnership(data.outfit_id, currentUserId);
    }

    const prismaData: Prisma.ai_messagesUncheckedCreateInput = {
      ...data,
    };

    return this.prisma.ai_messages.create({ data: prismaData });
  }

  findAll(query: ListQueryDto, currentUserId: string) {
    const { skip, take } = getPagination(query);
    const searchTerm = getSearchTerm(query);

    const searchFilter = searchTerm
      ? {
          OR: [
            { content: { contains: searchTerm, mode: 'insensitive' as const } },
            { role: { contains: searchTerm, mode: 'insensitive' as const } },
          ],
        }
      : undefined;

    return this.prisma.ai_messages.findMany({
      skip,
      take,
      orderBy: [{ created_at: 'asc' }, { ai_message_id: 'asc' }],
      where: {
        ai_conversations: {
          user_id: currentUserId,
        },
        ...(searchFilter ? searchFilter : {}),
      },
    });
  }

  async findOne(aiMessageId: string, currentUserId: string) {
    const message = await this.prisma.ai_messages.findFirst({
      where: {
        ai_message_id: aiMessageId,
        ai_conversations: {
          user_id: currentUserId,
        },
      },
    });

    if (!message) {
      throw new NotFoundException('AI message not found');
    }

    return message;
  }

  async update(
    aiMessageId: string,
    data: UpdateAiMessageDto,
    currentUserId: string,
  ) {
    const { ai_conversation_id, outfit_id, ...rest } = data;

    if (ai_conversation_id !== undefined) {
      await this.assertConversationOwnership(ai_conversation_id, currentUserId);
    }

    if (outfit_id !== undefined && outfit_id !== null) {
      await this.assertOutfitOwnership(outfit_id, currentUserId);
    }

    const prismaData: Prisma.ai_messagesUncheckedUpdateInput = {
      ...rest,
      ...(ai_conversation_id !== undefined ? { ai_conversation_id } : {}),
      ...(outfit_id !== undefined ? { outfit_id } : {}),
    };

    return this.prisma.ai_messages.update({
      where: {
        ai_message_id: aiMessageId,
        ai_conversations: { user_id: currentUserId },
      },
      data: prismaData,
    });
  }

  async remove(aiMessageId: string, currentUserId: string) {
    return this.prisma.ai_messages.delete({
      where: {
        ai_message_id: aiMessageId,
        ai_conversations: { user_id: currentUserId },
      },
    });
  }
}
