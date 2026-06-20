import 'dotenv/config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { Client } from 'pg';
import request from 'supertest';
import { App } from 'supertest/types';
import { TEST_JWT_SECRET } from '../src/auth/constants';
import { AppModule } from '../src/app.module';

describe('Entities CRUD (e2e)', () => {
  jest.setTimeout(30000);

  let app: INestApplication<App>;
  let dbClient: Client;

  let authUserId: string | null = null;
  let otherAuthUserId: string | null = null;
  let authEmail = '';
  let authToken = '';

  let userId: string | null = null;
  let typeId: string | null = null;
  let outfitId: string | null = null;
  let aiConversationId: string | null = null;
  let itemId: string | null = null;
  let scheduleId: string | null = null;
  let aiMessageId: string | null = null;
  let outfitItemLink: { outfitId: string; itemId: string } | null = null;

  const authHeader = () => ({ Authorization: `Bearer ${authToken}` });

  const authed = {
    get: (url: string) =>
      request(app.getHttpServer()).get(url).set(authHeader()),
    post: (url: string) =>
      request(app.getHttpServer()).post(url).set(authHeader()),
    patch: (url: string) =>
      request(app.getHttpServer()).patch(url).set(authHeader()),
    delete: (url: string) =>
      request(app.getHttpServer()).delete(url).set(authHeader()),
  };

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

    authEmail = `auth.e2e.${Date.now()}@example.com`;
    authUserId = randomUUID();
    const now = new Date();

    await dbClient.query(
      `insert into auth.users (id, aud, role, email, created_at, updated_at)
       values ($1, $2, $3, $4, $5, $5)`,
      [authUserId, 'authenticated', 'authenticated', authEmail, now],
    );

    const secret =
      process.env.SUPABASE_JWT_SECRET ??
      process.env.JWT_SECRET ??
      TEST_JWT_SECRET;
    const jwtService = new JwtService({ secret });

    authToken = jwtService.sign({
      sub: authUserId,
      aud: 'authenticated',
      email: authEmail,
      role: 'authenticated',
    });
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

    if (authUserId) {
      await dbClient.query('delete from auth.users where id = $1', [
        authUserId,
      ]);
    }

    if (otherAuthUserId) {
      await dbClient.query('delete from auth.users where id = $1', [
        otherAuthUserId,
      ]);
    }

    await dbClient.end();
    await app.close();
  });

  it('should block protected routes without JWT', async () => {
    await request(app.getHttpServer()).get('/types').expect(401);
  });
  w;
  it('should validate POST /items payload', async () => {
    await authed.post('/items').send({}).expect(400);
    await authed
      .post('/items')
      .send({ name: 'Spoofed item', colors: [], user_id: randomUUID() })
      .expect(400);
  });

  it('should cover CRUD endpoints for all entities', async () => {
    const now = new Date();
    const unique = now.getTime();

    userId = authUserId;
    expect(userId).toBeDefined();

    await authed.get('/users').expect(404);

    const currentUser = await authed.get('/users/me').expect(200);
    expect(currentUser.body.user_id).toBe(userId);
    expect(currentUser.body.email).toBe(authEmail);

    const selfUpdate = await authed
      .patch('/users/me')
      .send({ firstname: 'Entities', lastname: `Updated-${unique}` })
      .expect(200);

    expect(selfUpdate.body.lastname).toBe(`Updated-${unique}`);

    await authed
      .patch(`/users/${userId}`)
      .send({ description: `Admin update ${unique}` })
      .expect(404);

    await authed
      .patch('/users/me')
      .send({ email: `forbidden.${unique}@example.com` })
      .expect(400);

    await authed.get(`/users/${userId}`).expect(404);
    await authed.post('/users').send({}).expect(404);
    await authed.delete(`/users/${userId}`).expect(404);

    typeId = randomUUID();
    await dbClient.query(
      'insert into types (type_id, name, description) values ($1, $2, $3)',
      [typeId, `Type-${unique}`, 'e2e type'],
    );

    await authed.post('/types').send({ name: 'forbidden' }).expect(404);

    const typesList = await authed
      .get('/types')
      .query({ q: `Type-${unique}`, page: 1, limit: 20 })
      .expect(200);

    expect(Array.isArray(typesList.body)).toBe(true);
    expect(
      typesList.body.some((row: { type_id: string }) => row.type_id === typeId),
    ).toBe(true);

    await authed.get(`/types/${typeId}`).expect(200);

    await authed
      .patch(`/types/${typeId}`)
      .send({ description: 'updated type' })
      .expect(404);

    await authed.delete(`/types/${typeId}`).expect(404);

    await authed
      .post('/items')
      .send({
        name: 'Invalid relation',
        colors: [],
        type_id: randomUUID(),
      })
      .expect(400);

    const outfitCreate = await authed
      .post('/outfits')
      .send({
        name: `Outfit-${unique}`,
        theme: 'casual',
      })
      .expect(201);

    outfitId = outfitCreate.body.outfit_id;
    expect(outfitId).toBeDefined();
    expect(outfitCreate.body.created_at).toBeDefined();

    const outfitsList = await authed
      .get('/outfits')
      .query({ q: `Outfit-${unique}`, page: 1, limit: 20 })
      .expect(200);

    expect(Array.isArray(outfitsList.body)).toBe(true);
    expect(
      outfitsList.body.some(
        (row: { outfit_id: string }) => row.outfit_id === outfitId,
      ),
    ).toBe(true);

    await authed.get(`/outfits/${outfitId}`).expect(200);

    const outfitUpdate = await authed
      .patch(`/outfits/${outfitId}`)
      .send({ theme: 'formal' })
      .expect(200);

    expect(outfitUpdate.body.theme).toBe('formal');

    const aiConversationCreate = await authed
      .post('/ai-conversations')
      .send({
        title: `Conversation-${unique}`,
      })
      .expect(201);

    aiConversationId = aiConversationCreate.body.ai_conversation_id;
    expect(aiConversationId).toBeDefined();
    expect(aiConversationCreate.body.created_at).toBeDefined();

    const aiConversationsList = await authed
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

    await authed.get(`/ai-conversations/${aiConversationId}`).expect(200);

    const aiConversationUpdate = await authed
      .patch(`/ai-conversations/${aiConversationId}`)
      .send({ title: `Conversation-updated-${unique}` })
      .expect(200);

    expect(aiConversationUpdate.body.title).toBe(
      `Conversation-updated-${unique}`,
    );

    const itemCreate = await authed
      .post('/items')
      .send({
        name: `Item-${unique}`,
        colors: ['black'],
        type_id: typeId,
      })
      .expect(201);

    itemId = itemCreate.body.item_id;
    expect(itemId).toBeDefined();
    expect(itemCreate.body.added_at).toBeDefined();

    otherAuthUserId = randomUUID();
    const otherEmail = `other.e2e.${unique}@example.com`;
    await dbClient.query(
      `insert into auth.users (id, aud, role, email, created_at, updated_at)
       values ($1, $2, $3, $4, $5, $5)`,
      [otherAuthUserId, 'authenticated', 'authenticated', otherEmail, now],
    );

    const ownerToken = authToken;
    const secret =
      process.env.SUPABASE_JWT_SECRET ??
      process.env.JWT_SECRET ??
      TEST_JWT_SECRET;
    authToken = new JwtService({ secret }).sign({
      sub: otherAuthUserId,
      aud: 'authenticated',
      email: otherEmail,
      role: 'authenticated',
    });

    await authed.get(`/items/${itemId}`).expect(404);
    await authed
      .patch(`/items/${itemId}`)
      .send({ brand: 'hijack' })
      .expect(404);
    await authed.delete(`/items/${itemId}`).expect(404);
    authToken = ownerToken;

    const itemsList = await authed
      .get('/items')
      .query({ q: `Item-${unique}`, page: 1, limit: 20 })
      .expect(200);

    expect(Array.isArray(itemsList.body)).toBe(true);
    expect(
      itemsList.body.some((row: { item_id: string }) => row.item_id === itemId),
    ).toBe(true);

    await authed.get(`/items/${itemId}`).expect(200);

    const itemUpdate = await authed
      .patch(`/items/${itemId}`)
      .send({ brand: 'updated-brand' })
      .expect(200);

    expect(itemUpdate.body.brand).toBe('updated-brand');

    const outfitItemCreate = await authed
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

    const outfitItemsList = await authed
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

    await authed.get(`/outfit-items/${outfitId}/${itemId}`).expect(200);

    await authed
      .patch(`/outfit-items/${outfitId}/${itemId}`)
      .send({
        outfit_id: outfitId,
        item_id: itemId,
      })
      .expect(200);

    const scheduleCreate = await authed
      .post('/schedules')
      .send({
        planned_for: new Date(now.getTime() + 86400000).toISOString(),
        outfit_id: outfitId,
      })
      .expect(201);

    scheduleId = scheduleCreate.body.schedule_id;
    expect(scheduleId).toBeDefined();
    expect(scheduleCreate.body.created_at).toBeDefined();

    const schedulesList = await authed
      .get('/schedules')
      .query({ page: 1, limit: 20 })
      .expect(200);

    expect(Array.isArray(schedulesList.body)).toBe(true);
    expect(
      schedulesList.body.some(
        (row: { schedule_id: string }) => row.schedule_id === scheduleId,
      ),
    ).toBe(true);

    await authed.get(`/schedules/${scheduleId}`).expect(200);

    const scheduleUpdate = await authed
      .patch(`/schedules/${scheduleId}`)
      .send({
        planned_for: new Date(now.getTime() + 172800000).toISOString(),
      })
      .expect(200);

    expect(scheduleUpdate.body.schedule_id).toBe(scheduleId);

    const aiMessageCreate = await authed
      .post('/ai-messages')
      .send({
        content: `Message-${unique}`,
        role: 'user',
        ai_conversation_id: aiConversationId,
        outfit_id: outfitId,
      })
      .expect(201);

    aiMessageId = aiMessageCreate.body.ai_message_id;
    expect(aiMessageId).toBeDefined();
    expect(aiMessageCreate.body.created_at).toBeDefined();

    const aiMessagesList = await authed
      .get('/ai-messages')
      .query({ q: `Message-${unique}`, page: 1, limit: 20 })
      .expect(200);

    expect(Array.isArray(aiMessagesList.body)).toBe(true);
    expect(
      aiMessagesList.body.some(
        (row: { ai_message_id: string }) => row.ai_message_id === aiMessageId,
      ),
    ).toBe(true);

    await authed.get(`/ai-messages/${aiMessageId}`).expect(200);

    const aiMessageUpdate = await authed
      .patch(`/ai-messages/${aiMessageId}`)
      .send({ role: 'assistant' })
      .expect(200);

    expect(aiMessageUpdate.body.role).toBe('assistant');

    const aiMessageDelete = await authed
      .delete(`/ai-messages/${aiMessageId}`)
      .expect(200);

    expect(aiMessageDelete.body.ai_message_id).toBe(aiMessageId);
    aiMessageId = null;

    const scheduleDelete = await authed
      .delete(`/schedules/${scheduleId}`)
      .expect(200);

    expect(scheduleDelete.body.schedule_id).toBe(scheduleId);
    scheduleId = null;

    const outfitItemDelete = await authed
      .delete(`/outfit-items/${outfitId}/${itemId}`)
      .expect(200);

    expect(outfitItemDelete.body.outfit_id).toBe(outfitId);
    expect(outfitItemDelete.body.item_id).toBe(itemId);
    outfitItemLink = null;

    const itemDelete = await authed.delete(`/items/${itemId}`).expect(200);

    expect(itemDelete.body.item_id).toBe(itemId);
    itemId = null;

    const aiConversationDelete = await authed
      .delete(`/ai-conversations/${aiConversationId}`)
      .expect(200);

    expect(aiConversationDelete.body.ai_conversation_id).toBe(aiConversationId);
    aiConversationId = null;

    const outfitDelete = await authed
      .delete(`/outfits/${outfitId}`)
      .expect(200);

    expect(outfitDelete.body.outfit_id).toBe(outfitId);
    outfitId = null;
  });
});
