import { E2eContext, type TestUser } from './support/e2e-context';

describe('Application and authentication (e2e)', () => {
  const context = new E2eContext();
  let user: TestUser;

  beforeAll(async () => {
    await context.start();
    user = await context.createUser('app-e2e');
  });

  afterAll(async () => {
    await context.stop();
  });

  it('exposes public root and database health routes', async () => {
    await context.publicRequest().get('/').expect(200).expect('Hello World!');
    await context
      .publicRequest()
      .get('/auth/health')
      .expect(200)
      .expect({ ok: true });
  });

  it('blocks protected routes without a JWT', async () => {
    await context.publicRequest().get('/types').expect(401);
  });

  it('returns the identity from the validated token', async () => {
    const response = await context.as(user).get('/auth/me').expect(200);

    expect(response.body).toEqual({
      userId: user.id,
      email: user.email,
      role: 'authenticated',
    });
  });
});
