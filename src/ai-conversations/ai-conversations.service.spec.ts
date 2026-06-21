import { NotFoundException } from '@nestjs/common';
import {
  asPrismaService,
  createPrismaMock,
  type PrismaMock,
} from '../../test/support/prisma-mock';
import { AiConversationsService } from './ai-conversations.service';

describe('AiConversationsService', () => {
  let prisma: PrismaMock;
  let service: AiConversationsService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new AiConversationsService(asPrismaService(prisma));
  });

  it('creates and lists conversations for the authenticated user', async () => {
    prisma.ai_conversations.create.mockResolvedValue({
      ai_conversation_id: 'conversation-1',
    });
    prisma.ai_conversations.findMany.mockResolvedValue([]);

    await service.create({ title: 'Stylist' }, 'user-1');
    await service.findAll({ q: 'stylist' }, 'user-1');

    expect(prisma.ai_conversations.create).toHaveBeenCalledWith({
      data: { title: 'Stylist', user_id: 'user-1' },
    });
    expect(prisma.ai_conversations.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          user_id: 'user-1',
          title: { contains: 'stylist', mode: 'insensitive' },
        },
      }),
    );
  });

  it('returns an owned conversation and hides others', async () => {
    prisma.ai_conversations.findFirst
      .mockResolvedValueOnce({ ai_conversation_id: 'conversation-1' })
      .mockResolvedValueOnce(null);

    await expect(service.findOne('conversation-1', 'user-1')).resolves.toEqual({
      ai_conversation_id: 'conversation-1',
    });
    await expect(
      service.findOne('conversation-1', 'user-2'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates and removes only owned conversations', async () => {
    prisma.ai_conversations.update.mockResolvedValue({
      ai_conversation_id: 'conversation-1',
    });
    prisma.ai_conversations.delete.mockResolvedValue({
      ai_conversation_id: 'conversation-1',
    });

    await service.update('conversation-1', { title: 'Updated' }, 'user-1');
    await service.remove('conversation-1', 'user-1');

    const where = {
      ai_conversation_id: 'conversation-1',
      user_id: 'user-1',
    };
    expect(prisma.ai_conversations.update).toHaveBeenCalledWith({
      where,
      data: { title: 'Updated' },
    });
    expect(prisma.ai_conversations.delete).toHaveBeenCalledWith({ where });
  });
});
