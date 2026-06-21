import { randomUUID } from 'node:crypto';
import { E2eContext, type TestUser } from './support/e2e-context';

describe('Users and types (e2e)', () => {
  const context = new E2eContext();
  let user: TestUser;
  let typeId: string;
  const unique = Date.now();

  beforeAll(async () => {
    await context.start();
    user = await context.createUser('users-types-e2e');
    typeId = await context.createType(`Type-${unique}`);
  });

  afterAll(async () => {
    await context.stop();
  });

  it('allows access only to the current profile', async () => {
    const profile = await context.as(user).get('/users/me').expect(200);
    expect(profile.body.user_id).toBe(user.id);
    expect(profile.body.email).toBe(user.email);

    const updated = await context
      .as(user)
      .patch('/users/me')
      .send({ firstname: 'Ada', lastname: 'Lovelace' })
      .expect(200);
    expect(updated.body.firstname).toBe('Ada');

    await context
      .as(user)
      .patch('/users/me')
      .send({ email: 'forbidden@example.com' })
      .expect(400);

    await context.as(user).get(`/users/${randomUUID()}`).expect(404);
    await context.as(user).post('/users').send({}).expect(404);
    await context.as(user).delete(`/users/${randomUUID()}`).expect(404);
  });

  it('exposes types as a shared read-only catalogue', async () => {
    const list = await context
      .as(user)
      .get('/types')
      .query({ q: `Type-${unique}`, page: 1, limit: 20 })
      .expect(200);

    expect(
      list.body.some((type: { type_id: string }) => type.type_id === typeId),
    ).toBe(true);

    await context.as(user).get(`/types/${typeId}`).expect(200);
    await context
      .as(user)
      .post('/types')
      .send({ name: 'forbidden' })
      .expect(404);
    await context
      .as(user)
      .patch(`/types/${typeId}`)
      .send({ name: 'forbidden' })
      .expect(404);
    await context.as(user).delete(`/types/${typeId}`).expect(404);
  });
});
