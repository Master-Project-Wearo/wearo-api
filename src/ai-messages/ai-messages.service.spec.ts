import { NotFoundException } from '@nestjs/common';
import {
  asPrismaService,
  createPrismaMock,
  type PrismaMock,
} from '../../test/support/prisma-mock';
import { AI_MESSAGE_ROLES } from './ai-message-role';
import { AiMessagesService } from './ai-messages.service';

describe('AiMessagesService', () => {
  let prisma: PrismaMock;
  let service: AiMessagesService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new AiMessagesService(asPrismaService(prisma));
    prisma.ai_conversations.findFirst.mockResolvedValue({
      ai_conversation_id: 'conversation-1',
    });
  });

  it('assigns the user role to public messages', async () => {
    prisma.ai_messages.create.mockResolvedValue({ ai_message_id: 'message-1' });

    await service.create(
      {
        content: 'Hello',
        ai_conversation_id: 'conversation-1',
      },
      'user-1',
    );

    expect(prisma.ai_messages.create).toHaveBeenCalledWith({
      data: {
        content: 'Hello',
        ai_conversation_id: 'conversation-1',
        role: AI_MESSAGE_ROLES.USER,
      },
    });
  });

  it('assigns assistant only through the internal response method', async () => {
    prisma.ai_messages.create.mockResolvedValue({ ai_message_id: 'message-1' });

    await service.createAssistantResponse(
      {
        content: 'AI response',
        ai_conversation_id: 'conversation-1',
      },
      'user-1',
    );

    expect(prisma.ai_messages.create).toHaveBeenCalledWith({
      data: {
        content: 'AI response',
        ai_conversation_id: 'conversation-1',
        role: AI_MESSAGE_ROLES.ASSISTANT,
      },
    });
  });

  it('validates both conversation and optional outfit ownership', async () => {
    prisma.outfits.findFirst.mockResolvedValue({ outfit_id: 'outfit-1' });
    prisma.ai_messages.create.mockResolvedValue({ ai_message_id: 'message-1' });

    await service.create(
      {
        content: 'Look',
        ai_conversation_id: 'conversation-1',
        outfit_id: 'outfit-1',
      },
      'user-1',
    );

    expect(prisma.outfits.findFirst).toHaveBeenCalledWith({
      where: { outfit_id: 'outfit-1', user_id: 'user-1' },
      select: { outfit_id: true },
    });
  });

  it('rejects a conversation owned by another user', async () => {
    prisma.ai_conversations.findFirst.mockResolvedValue(null);

    await expect(
      service.create(
        {
          content: 'Forbidden',
          ai_conversation_id: 'conversation-1',
        },
        'user-2',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prisma.ai_messages.create).not.toHaveBeenCalled();
  });

  it('lists and returns messages through an owned conversation', async () => {
    prisma.ai_messages.findMany.mockResolvedValue([]);
    prisma.ai_messages.findFirst.mockResolvedValue({
      ai_message_id: 'message-1',
    });

    await service.findAll({ q: 'hello' }, 'user-1');
    await service.findOne('message-1', 'user-1');

    expect(prisma.ai_messages.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          ai_conversations: { user_id: 'user-1' },
          OR: [
            { content: { contains: 'hello', mode: 'insensitive' } },
            { role: { contains: 'hello', mode: 'insensitive' } },
          ],
        },
      }),
    );
    expect(prisma.ai_messages.findFirst).toHaveBeenCalledWith({
      where: {
        ai_message_id: 'message-1',
        ai_conversations: { user_id: 'user-1' },
      },
    });
  });

  it('hides a message owned by another user', async () => {
    prisma.ai_messages.findFirst.mockResolvedValue(null);

    await expect(service.findOne('message-1', 'user-2')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('validates new relations before updating a message', async () => {
    prisma.outfits.findFirst.mockResolvedValue({ outfit_id: 'outfit-2' });
    prisma.ai_messages.update.mockResolvedValue({
      ai_message_id: 'message-1',
    });

    await service.update(
      'message-1',
      {
        content: 'Updated',
        ai_conversation_id: 'conversation-2',
        outfit_id: 'outfit-2',
      },
      'user-1',
    );

    expect(prisma.ai_conversations.findFirst).toHaveBeenLastCalledWith({
      where: {
        ai_conversation_id: 'conversation-2',
        user_id: 'user-1',
      },
      select: { ai_conversation_id: true },
    });
    expect(prisma.ai_messages.update).toHaveBeenCalledWith({
      where: {
        ai_message_id: 'message-1',
        ai_conversations: { user_id: 'user-1' },
      },
      data: {
        content: 'Updated',
        ai_conversation_id: 'conversation-2',
        outfit_id: 'outfit-2',
      },
    });
  });

  it('removes only a message from an owned conversation', async () => {
    prisma.ai_messages.delete.mockResolvedValue({
      ai_message_id: 'message-1',
    });

    await service.remove('message-1', 'user-1');

    expect(prisma.ai_messages.delete).toHaveBeenCalledWith({
      where: {
        ai_message_id: 'message-1',
        ai_conversations: { user_id: 'user-1' },
      },
    });
  });
});
