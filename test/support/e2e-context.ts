import 'dotenv/config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { Client } from 'pg';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { TEST_JWT_SECRET } from '../../src/auth/constants';

export type TestUser = {
  id: string;
  email: string;
  token: string;
};

export class E2eContext {
  app!: INestApplication<App>;
  db!: Client;

  private readonly authUserIds: string[] = [];
  private readonly typeIds: string[] = [];

  async start() {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.app = moduleFixture.createNestApplication();
    this.app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await this.app.init();

    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set for e2e tests');
    }

    this.db = new Client({ connectionString });
    await this.db.connect();
  }

  async stop() {
    if (this.db) {
      for (const userId of this.authUserIds.reverse()) {
        await this.db.query('delete from auth.users where id = $1', [userId]);
      }

      for (const typeId of this.typeIds.reverse()) {
        await this.db.query('delete from types where type_id = $1', [typeId]);
      }

      await this.db.end();
    }

    if (this.app) {
      await this.app.close();
    }
  }

  async createUser(label: string): Promise<TestUser> {
    const id = randomUUID();
    const email = `${label}.${Date.now()}.${id}@example.com`;
    const now = new Date();

    await this.db.query(
      `insert into auth.users (id, aud, role, email, created_at, updated_at)
       values ($1, $2, $3, $4, $5, $5)`,
      [id, 'authenticated', 'authenticated', email, now],
    );

    this.authUserIds.push(id);

    const token = new JwtService({ secret: TEST_JWT_SECRET }).sign({
      sub: id,
      aud: 'authenticated',
      email,
      role: 'authenticated',
    });

    return { id, email, token };
  }

  async createType(name: string) {
    const id = randomUUID();
    await this.db.query(
      'insert into types (type_id, name, description) values ($1, $2, $3)',
      [id, name, 'e2e type'],
    );
    this.typeIds.push(id);
    return id;
  }

  as(user: TestUser) {
    const authHeader = { Authorization: `Bearer ${user.token}` };
    const server = this.app.getHttpServer();

    return {
      get: (url: string) => request(server).get(url).set(authHeader),
      post: (url: string) => request(server).post(url).set(authHeader),
      patch: (url: string) => request(server).patch(url).set(authHeader),
      delete: (url: string) => request(server).delete(url).set(authHeader),
    };
  }

  publicRequest() {
    return request(this.app.getHttpServer());
  }
}
