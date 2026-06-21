import { E2eContext, type TestUser } from './support/e2e-context';

type WardrobeFixture = {
  itemId: string;
  outfitId: string;
  scheduleId: string;
};

describe('Wardrobe resources (e2e)', () => {
  const context = new E2eContext();
  let owner: TestUser;
  let otherUser: TestUser;
  let typeId: string;

  beforeAll(async () => {
    await context.start();
    owner = await context.createUser('wardrobe-owner-e2e');
    otherUser = await context.createUser('wardrobe-other-e2e');
    typeId = await context.createType(`Wardrobe-type-${Date.now()}`);
  });

  afterAll(async () => {
    await context.stop();
  });

  async function createWardrobe(
    user: TestUser,
    label: string,
  ): Promise<WardrobeFixture> {
    const outfit = await context
      .as(user)
      .post('/outfits')
      .send({ name: `Outfit-${label}`, theme: 'casual' })
      .expect(201);

    const item = await context
      .as(user)
      .post('/items')
      .send({
        name: `Item-${label}`,
        colors: ['black'],
        type_id: typeId,
      })
      .expect(201);

    await context
      .as(user)
      .post('/outfit-items')
      .send({
        outfit_id: outfit.body.outfit_id,
        item_id: item.body.item_id,
      })
      .expect(201);

    const schedule = await context
      .as(user)
      .post('/schedules')
      .send({
        planned_for: new Date(Date.now() + 86400000).toISOString(),
        outfit_id: outfit.body.outfit_id,
      })
      .expect(201);

    return {
      itemId: item.body.item_id,
      outfitId: outfit.body.outfit_id,
      scheduleId: schedule.body.schedule_id,
    };
  }

  it('supports the complete owned wardrobe lifecycle', async () => {
    const label = `crud-${Date.now()}`;
    const fixture = await createWardrobe(owner, label);

    await context.as(owner).get(`/items/${fixture.itemId}`).expect(200);
    await context.as(owner).get(`/outfits/${fixture.outfitId}`).expect(200);
    await context
      .as(owner)
      .get(`/outfit-items/${fixture.outfitId}/${fixture.itemId}`)
      .expect(200);
    await context.as(owner).get(`/schedules/${fixture.scheduleId}`).expect(200);

    const items = await context
      .as(owner)
      .get('/items')
      .query({ q: `Item-${label}` })
      .expect(200);
    const outfits = await context
      .as(owner)
      .get('/outfits')
      .query({ q: `Outfit-${label}` })
      .expect(200);
    expect(items.body).toHaveLength(1);
    expect(outfits.body).toHaveLength(1);

    await context
      .as(owner)
      .patch(`/items/${fixture.itemId}`)
      .send({ brand: 'Wearo' })
      .expect(200);
    await context
      .as(owner)
      .patch(`/outfits/${fixture.outfitId}`)
      .send({ theme: 'formal' })
      .expect(200);
    await context
      .as(owner)
      .patch(`/schedules/${fixture.scheduleId}`)
      .send({ planned_for: new Date(Date.now() + 172800000).toISOString() })
      .expect(200);

    await context
      .as(owner)
      .delete(`/schedules/${fixture.scheduleId}`)
      .expect(200);
    await context
      .as(owner)
      .delete(`/outfit-items/${fixture.outfitId}/${fixture.itemId}`)
      .expect(200);
    await context.as(owner).delete(`/items/${fixture.itemId}`).expect(200);
    await context.as(owner).delete(`/outfits/${fixture.outfitId}`).expect(200);
  });

  it('denies every cross-user wardrobe access path', async () => {
    const label = `isolated-${Date.now()}`;
    const fixture = await createWardrobe(owner, label);
    const other = context.as(otherUser);

    await other
      .get('/items')
      .query({ q: `Item-${label}` })
      .expect(200, []);
    await other
      .get('/outfits')
      .query({ q: `Outfit-${label}` })
      .expect(200, []);
    await other.get('/outfit-items').expect(200, []);
    await other.get('/schedules').expect(200, []);

    await other.get(`/items/${fixture.itemId}`).expect(404);
    await other
      .patch(`/items/${fixture.itemId}`)
      .send({ brand: 'hijack' })
      .expect(404);
    await other.delete(`/items/${fixture.itemId}`).expect(404);

    await other.get(`/outfits/${fixture.outfitId}`).expect(404);
    await other
      .patch(`/outfits/${fixture.outfitId}`)
      .send({ theme: 'hijack' })
      .expect(404);
    await other.delete(`/outfits/${fixture.outfitId}`).expect(404);

    await other
      .get(`/outfit-items/${fixture.outfitId}/${fixture.itemId}`)
      .expect(404);
    await other
      .delete(`/outfit-items/${fixture.outfitId}/${fixture.itemId}`)
      .expect(404);

    await other.get(`/schedules/${fixture.scheduleId}`).expect(404);
    await other
      .patch(`/schedules/${fixture.scheduleId}`)
      .send({ planned_for: new Date().toISOString() })
      .expect(404);
    await other.delete(`/schedules/${fixture.scheduleId}`).expect(404);

    await other
      .post('/outfit-items')
      .send({
        outfit_id: fixture.outfitId,
        item_id: fixture.itemId,
      })
      .expect(404);
    await other
      .post('/schedules')
      .send({
        planned_for: new Date().toISOString(),
        outfit_id: fixture.outfitId,
      })
      .expect(404);
  });
});
