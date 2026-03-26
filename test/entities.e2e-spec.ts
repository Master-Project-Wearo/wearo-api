import 'dotenv/config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Client } from 'pg';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Entities CRUD (e2e)', () => {
  let app: INestApplication<App>;
  let dbClient: Client;

  let userId: string | null = null;
  let typeId: string | null = null;
  let outfitId: string | null = null;
  let aiConversationId: string | null = null;
  let itemId: string | null = null;
  let scheduleId: string | null = null;
  let aiMessageId: string | null = null;
  let outfitItemLink: { outfitId: string; itemId: string } | null = null;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    const connectionString = process.env['DATABASE_URL'];
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set for e2e tests');
    }

    dbClient = new Client({ connectionString });
    await dbClient.connect();
  });

  afterAll(async () => {
    if (aiMessageId) {
      await dbClient.query('delete from ai_messages where ai_message_id = $1', [
        aiMessageId,
      ]);
    }

    if (scheduleId) {
      await dbClient.query('delete from schedules where schedule_id = $1', [
        scheduleId,
      ]);
    }

    if (outfitItemLink) {
      await dbClient.query(
        'delete from outfit_items where outfit_id = $1 and item_id = $2',
        [outfitItemLink.outfitId, outfitItemLink.itemId],
      );
    }

    if (itemId) {
      await dbClient.query('delete from items where item_id = $1', [itemId]);
    }

    if (aiConversationId) {
      await dbClient.query(
        'delete from ai_conversations where ai_conversation_id = $1',
        [aiConversationId],
      );
    }

    if (outfitId) {
      await dbClient.query('delete from outfits where outfit_id = $1', [
        outfitId,
      ]);
    }

    if (typeId) {
      await dbClient.query('delete from types where type_id = $1', [typeId]);
    }

    if (userId) {
      await dbClient.query('delete from users where user_id = $1', [userId]);
    }

    await dbClient.end();
    await app.close();
  });

  it('should validate POST /items payload', async () => {
    await request(app.getHttpServer()).post('/items').send({}).expect(400);
  });

  it('should cover CRUD endpoints for all remaining entities', async () => {
    const now = new Date();
    const unique = now.getTime();

    const userCreate = await request(app.getHttpServer())
      .post('/users')
      .send({
        firstname: 'Entities',
        lastname: `E2E-${unique}`,
        email: `entities.e2e.${unique}@example.com`,
        date_of_birth: new Date('2000-01-01T00:00:00.000Z').toISOString(),
      })
      .expect(201);

    userId = userCreate.body.user_id;
    expect(userId).toBeDefined();

    const usersList = await request(app.getHttpServer())
      .get('/users')
      .query({ q: 'Entities', page: 1, limit: 20 })
      .expect(200);

    expect(Array.isArray(usersList.body)).toBe(true);
    expect(
      usersList.body.some((row: { user_id: string }) => row.user_id === userId),
    ).toBe(true);

    await request(app.getHttpServer()).get(`/users/${userId}`).expect(200);

    const userUpdate = await request(app.getHttpServer())
      .patch(`/users/${userId}`)
      .send({ lastname: `Updated-${unique}` })
      .expect(200);

    expect(userUpdate.body.lastname).toBe(`Updated-${unique}`);

    const typeCreate = await request(app.getHttpServer())
      .post('/types')
      .send({
        name: `Type-${unique}`,
        description: 'e2e type',
      })
      .expect(201);

    typeId = typeCreate.body.type_id;
    expect(typeId).toBeDefined();

    const typesList = await request(app.getHttpServer())
      .get('/types')
      .query({ q: `Type-${unique}`, page: 1, limit: 20 })
      .expect(200);

    expect(Array.isArray(typesList.body)).toBe(true);
    expect(
      typesList.body.some((row: { type_id: string }) => row.type_id === typeId),
    ).toBe(true);

    await request(app.getHttpServer()).get(`/types/${typeId}`).expect(200);

    const typeUpdate = await request(app.getHttpServer())
      .patch(`/types/${typeId}`)
      .send({ description: 'updated type' })
      .expect(200);

    expect(typeUpdate.body.description).toBe('updated type');

    const outfitCreate = await request(app.getHttpServer())
      .post('/outfits')
      .send({
        name: `Outfit-${unique}`,
        theme: 'casual',
        created_at: now.toISOString(),
        user_id: userId,
      })
      .expect(201);

    outfitId = outfitCreate.body.outfit_id;
    expect(outfitId).toBeDefined();

    const outfitsList = await request(app.getHttpServer())
      .get('/outfits')
      .query({ q: `Outfit-${unique}`, page: 1, limit: 20 })
      .expect(200);

    expect(Array.isArray(outfitsList.body)).toBe(true);
    expect(
      outfitsList.body.some(
        (row: { outfit_id: string }) => row.outfit_id === outfitId,
      ),
    ).toBe(true);

    await request(app.getHttpServer()).get(`/outfits/${outfitId}`).expect(200);

    const outfitUpdate = await request(app.getHttpServer())
      .patch(`/outfits/${outfitId}`)
      .send({ theme: 'formal' })
      .expect(200);

    expect(outfitUpdate.body.theme).toBe('formal');

    const aiConversationCreate = await request(app.getHttpServer())
      .post('/ai-conversations')
      .send({
        title: `Conversation-${unique}`,
        created_at: now.toISOString(),
        user_id: userId,
      })
      .expect(201);

    aiConversationId = aiConversationCreate.body.ai_conversation_id;
    expect(aiConversationId).toBeDefined();

    const aiConversationsList = await request(app.getHttpServer())
      .get('/ai-conversations')
      .query({ q: `Conversation-${unique}`, page: 1, limit: 20 })
      .expect(200);

    expect(Array.isArray(aiConversationsList.body)).toBe(true);
    expect(
      aiConversationsList.body.some(
        (row: { ai_conversation_id: string }) =>
          row.ai_conversation_id === aiConversationId,
      ),
    ).toBe(true);

    await request(app.getHttpServer())
      .get(`/ai-conversations/${aiConversationId}`)
      .expect(200);

    const aiConversationUpdate = await request(app.getHttpServer())
      .patch(`/ai-conversations/${aiConversationId}`)
      .send({ title: `Conversation-updated-${unique}` })
      .expect(200);

    expect(aiConversationUpdate.body.title).toBe(
      `Conversation-updated-${unique}`,
    );

    const itemCreate = await request(app.getHttpServer())
      .post('/items')
      .send({
        name: `Item-${unique}`,
        colors: ['black'],
        added_at: now.toISOString(),
        user_id: userId,
        type_id: typeId,
      })
      .expect(201);

    itemId = itemCreate.body.item_id;
    expect(itemId).toBeDefined();

    const itemsList = await request(app.getHttpServer())
      .get('/items')
      .query({ q: `Item-${unique}`, page: 1, limit: 20 })
      .expect(200);

    expect(Array.isArray(itemsList.body)).toBe(true);
    expect(
      itemsList.body.some((row: { item_id: string }) => row.item_id === itemId),
    ).toBe(true);

    await request(app.getHttpServer()).get(`/items/${itemId}`).expect(200);

    const itemUpdate = await request(app.getHttpServer())
      .patch(`/items/${itemId}`)
      .send({ brand: 'updated-brand' })
      .expect(200);

    expect(itemUpdate.body.brand).toBe('updated-brand');

    const outfitItemCreate = await request(app.getHttpServer())
      .post('/outfit-items')
      .send({
        outfit_id: outfitId,
        item_id: itemId,
      })
      .expect(201);

    outfitItemLink = {
      outfitId: outfitItemCreate.body.outfit_id,
      itemId: outfitItemCreate.body.item_id,
    };

    expect(outfitItemLink.outfitId).toBe(outfitId);
    expect(outfitItemLink.itemId).toBe(itemId);

    const outfitItemsList = await request(app.getHttpServer())
      .get('/outfit-items')
      .query({ page: 1, limit: 20 })
      .expect(200);

    expect(Array.isArray(outfitItemsList.body)).toBe(true);
    expect(
      outfitItemsList.body.some(
        (row: { outfit_id: string; item_id: string }) =>
          row.outfit_id === outfitId && row.item_id === itemId,
      ),
    ).toBe(true);

    await request(app.getHttpServer())
      .get(`/outfit-items/${outfitId}/${itemId}`)
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/outfit-items/${outfitId}/${itemId}`)
      .send({
        outfit_id: outfitId,
        item_id: itemId,
      })
      .expect(200);

    const scheduleCreate = await request(app.getHttpServer())
      .post('/schedules')
      .send({
        planned_for: new Date(now.getTime() + 86400000).toISOString(),
        created_at: now.toISOString(),
        user_id: userId,
        outfit_id: outfitId,
      })
      .expect(201);

    scheduleId = scheduleCreate.body.schedule_id;
    expect(scheduleId).toBeDefined();

    const schedulesList = await request(app.getHttpServer())
      .get('/schedules')
      .query({ page: 1, limit: 20 })
      .expect(200);

    expect(Array.isArray(schedulesList.body)).toBe(true);
    expect(
      schedulesList.body.some(
        (row: { schedule_id: string }) => row.schedule_id === scheduleId,
      ),
    ).toBe(true);

    await request(app.getHttpServer())
      .get(`/schedules/${scheduleId}`)
      .expect(200);

    const scheduleUpdate = await request(app.getHttpServer())
      .patch(`/schedules/${scheduleId}`)
      .send({
        planned_for: new Date(now.getTime() + 172800000).toISOString(),
      })
      .expect(200);

    expect(scheduleUpdate.body.schedule_id).toBe(scheduleId);

    const aiMessageCreate = await request(app.getHttpServer())
      .post('/ai-messages')
      .send({
        content: `Message-${unique}`,
        role: 'user',
        created_at: now.toISOString(),
        ai_conversation_id: aiConversationId,
        outfit_id: outfitId,
      })
      .expect(201);

    aiMessageId = aiMessageCreate.body.ai_message_id;
    expect(aiMessageId).toBeDefined();

    const aiMessagesList = await request(app.getHttpServer())
      .get('/ai-messages')
      .query({ q: `Message-${unique}`, page: 1, limit: 20 })
      .expect(200);

    expect(Array.isArray(aiMessagesList.body)).toBe(true);
    expect(
      aiMessagesList.body.some(
        (row: { ai_message_id: string }) => row.ai_message_id === aiMessageId,
      ),
    ).toBe(true);

    await request(app.getHttpServer())
      .get(`/ai-messages/${aiMessageId}`)
      .expect(200);

    const aiMessageUpdate = await request(app.getHttpServer())
      .patch(`/ai-messages/${aiMessageId}`)
      .send({ role: 'assistant' })
      .expect(200);

    expect(aiMessageUpdate.body.role).toBe('assistant');

    const aiMessageDelete = await request(app.getHttpServer())
      .delete(`/ai-messages/${aiMessageId}`)
      .expect(200);

    expect(aiMessageDelete.body.ai_message_id).toBe(aiMessageId);
    aiMessageId = null;

    const scheduleDelete = await request(app.getHttpServer())
      .delete(`/schedules/${scheduleId}`)
      .expect(200);

    expect(scheduleDelete.body.schedule_id).toBe(scheduleId);
    scheduleId = null;

    const outfitItemDelete = await request(app.getHttpServer())
      .delete(`/outfit-items/${outfitId}/${itemId}`)
      .expect(200);

    expect(outfitItemDelete.body.outfit_id).toBe(outfitId);
    expect(outfitItemDelete.body.item_id).toBe(itemId);
    outfitItemLink = null;

    const itemDelete = await request(app.getHttpServer())
      .delete(`/items/${itemId}`)
      .expect(200);

    expect(itemDelete.body.item_id).toBe(itemId);
    itemId = null;

    const aiConversationDelete = await request(app.getHttpServer())
      .delete(`/ai-conversations/${aiConversationId}`)
      .expect(200);

    expect(aiConversationDelete.body.ai_conversation_id).toBe(aiConversationId);
    aiConversationId = null;

    const outfitDelete = await request(app.getHttpServer())
      .delete(`/outfits/${outfitId}`)
      .expect(200);

    expect(outfitDelete.body.outfit_id).toBe(outfitId);
    outfitId = null;

    const typeDelete = await request(app.getHttpServer())
      .delete(`/types/${typeId}`)
      .expect(200);

    expect(typeDelete.body.type_id).toBe(typeId);
    typeId = null;

    const userDelete = await request(app.getHttpServer())
      .delete(`/users/${userId}`)
      .expect(200);

    expect(userDelete.body.user_id).toBe(userId);
    userId = null;
  });
});
