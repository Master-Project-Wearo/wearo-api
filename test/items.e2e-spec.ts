import 'dotenv/config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Client } from 'pg';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('ItemsController (e2e)', () => {
  let app: INestApplication<App>;
  let dbClient: Client;
  let testUserId: string;
  let createdItemId: string | null = null;

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

    const email = `items.e2e.${Date.now()}@example.com`;
    const userInsert = await dbClient.query(
      `insert into users (firstname, lastname, email, date_of_birth)
       values ($1, $2, $3, $4)
       returning user_id`,
      ['Items', 'E2E', email, new Date('2000-01-01T00:00:00.000Z')],
    );

    testUserId = userInsert.rows[0].user_id;
  });

  afterAll(async () => {
    if (createdItemId) {
      await dbClient.query('delete from items where item_id = $1', [
        createdItemId,
      ]);
    }

    if (testUserId) {
      await dbClient.query('delete from users where user_id = $1', [
        testUserId,
      ]);
    }

    await dbClient.end();
    await app.close();
  });

  it('should validate POST /items payload', async () => {
    await request(app.getHttpServer()).post('/items').send({}).expect(400);
  });

  it('should perform full CRUD on /items', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/items')
      .send({
        name: 'E2E Item',
        colors: ['black'],
        added_at: new Date().toISOString(),
        user_id: testUserId,
      })
      .expect(201);

    createdItemId = createResponse.body.item_id;

    expect(createdItemId).toBeDefined();
    expect(createResponse.body.name).toBe('E2E Item');

    const findOneResponse = await request(app.getHttpServer())
      .get(`/items/${createdItemId}`)
      .expect(200);

    expect(findOneResponse.body.item_id).toBe(createdItemId);

    const updateResponse = await request(app.getHttpServer())
      .patch(`/items/${createdItemId}`)
      .send({ brand: 'E2E Brand' })
      .expect(200);

    expect(updateResponse.body.brand).toBe('E2E Brand');

    const deleteResponse = await request(app.getHttpServer())
      .delete(`/items/${createdItemId}`)
      .expect(200);

    expect(deleteResponse.body.item_id).toBe(createdItemId);

    createdItemId = null;
  });
});
