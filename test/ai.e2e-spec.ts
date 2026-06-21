import { E2eContext, type TestUser } from './support/e2e-context';

describe('AI conversations and messages (e2e)', () => {
  const context = new E2eContext();
  let owner: TestUser;
  let otherUser: TestUser;

  beforeAll(async () => {
    await context.start();
    owner = await context.createUser('ai-owner-e2e');
    otherUser = await context.createUser('ai-other-e2e');
  });

  afterAll(async () => {
    await context.stop();
  });

  async function createConversation(user: TestUser, label: string) {
    const response = await context
      .as(user)
      .post('/ai-conversations')
      .send({ title: `Conversation-${label}` })
      .expect(201);

    return response.body.ai_conversation_id as string;
  }

  async function createMessage(
    user: TestUser,
    conversationId: string,
    label: string,
  ) {
    const response = await context
      .as(user)
      .post('/ai-messages')
      .send({
        content: `Message-${label}`,
        ai_conversation_id: conversationId,
      })
      .expect(201);

    expect(response.body.role).toBe('user');
    return response.body.ai_message_id as string;
  }

  it('supports owned conversations and server-assigned user messages', async () => {
    const label = `crud-${Date.now()}`;
    const conversationId = await createConversation(owner, label);

    await context
      .as(owner)
      .post('/ai-messages')
      .send({
        content: 'Spoofed assistant',
        role: 'assistant',
        ai_conversation_id: conversationId,
      })
      .expect(400);

    const messageId = await createMessage(owner, conversationId, label);

    const conversations = await context
      .as(owner)
      .get('/ai-conversations')
      .query({ q: `Conversation-${label}` })
      .expect(200);
    const messages = await context
      .as(owner)
      .get('/ai-messages')
      .query({ q: `Message-${label}` })
      .expect(200);
    expect(conversations.body).toHaveLength(1);
    expect(messages.body).toHaveLength(1);

    await context
      .as(owner)
      .get(`/ai-conversations/${conversationId}`)
      .expect(200);
    await context.as(owner).get(`/ai-messages/${messageId}`).expect(200);

    await context
      .as(owner)
      .patch(`/ai-messages/${messageId}`)
      .send({ role: 'assistant' })
      .expect(400);

    const updated = await context
      .as(owner)
      .patch(`/ai-messages/${messageId}`)
      .send({ content: `Message-updated-${label}` })
      .expect(200);
    expect(updated.body.content).toBe(`Message-updated-${label}`);
    expect(updated.body.role).toBe('user');

    await context
      .as(owner)
      .patch(`/ai-conversations/${conversationId}`)
      .send({ title: `Conversation-updated-${label}` })
      .expect(200);

    await context.as(owner).delete(`/ai-messages/${messageId}`).expect(200);
    await context
      .as(owner)
      .delete(`/ai-conversations/${conversationId}`)
      .expect(200);
  });

  it('denies every cross-user AI access path', async () => {
    const label = `isolated-${Date.now()}`;
    const conversationId = await createConversation(owner, label);
    const messageId = await createMessage(owner, conversationId, label);
    const other = context.as(otherUser);

    await other
      .get('/ai-conversations')
      .query({ q: `Conversation-${label}` })
      .expect(200, []);
    await other
      .get('/ai-messages')
      .query({ q: `Message-${label}` })
      .expect(200, []);

    await other.get(`/ai-conversations/${conversationId}`).expect(404);
    await other
      .patch(`/ai-conversations/${conversationId}`)
      .send({ title: 'hijack' })
      .expect(404);
    await other.delete(`/ai-conversations/${conversationId}`).expect(404);

    await other.get(`/ai-messages/${messageId}`).expect(404);
    await other
      .patch(`/ai-messages/${messageId}`)
      .send({ content: 'hijack' })
      .expect(404);
    await other.delete(`/ai-messages/${messageId}`).expect(404);

    await other
      .post('/ai-messages')
      .send({
        content: 'hijack',
        ai_conversation_id: conversationId,
      })
      .expect(404);
  });
});
