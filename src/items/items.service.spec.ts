import { NotFoundException } from '@nestjs/common';
import {
  asPrismaService,
  createPrismaMock,
  type PrismaMock,
} from '../../test/support/prisma-mock';
import { ItemsService } from './items.service';

describe('ItemsService', () => {
  let prisma: PrismaMock;
  let service: ItemsService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new ItemsService(asPrismaService(prisma));
  });

  it('creates an item for the authenticated user', async () => {
    prisma.items.create.mockResolvedValue({ item_id: 'item-1' });

    await service.create(
      {
        name: 'Jacket',
        colors: ['black'],
        ai_attributes: { season: 'winter' },
      },
      'user-1',
    );

    expect(prisma.items.create).toHaveBeenCalledWith({
      data: {
        name: 'Jacket',
        colors: ['black'],
        ai_attributes: { season: 'winter' },
        user_id: 'user-1',
      },
    });
  });

  it('lists only owned items with pagination and search', async () => {
    prisma.items.findMany.mockResolvedValue([]);

    await service.findAll({ page: 2, limit: 10, q: ' jacket ' }, 'user-1');

    expect(prisma.items.findMany).toHaveBeenCalledWith({
      skip: 10,
      take: 10,
      orderBy: [{ added_at: 'desc' }, { item_id: 'desc' }],
      where: {
        user_id: 'user-1',
        OR: [
          { name: { contains: 'jacket', mode: 'insensitive' } },
          { brand: { contains: 'jacket', mode: 'insensitive' } },
          {
            ai_description: {
              contains: 'jacket',
              mode: 'insensitive',
            },
          },
        ],
      },
    });
  });

  it('returns only an owned item', async () => {
    prisma.items.findFirst.mockResolvedValue({ item_id: 'item-1' });

    await service.findOne('item-1', 'user-1');

    expect(prisma.items.findFirst).toHaveBeenCalledWith({
      where: { item_id: 'item-1', user_id: 'user-1' },
    });
  });

  it('hides an item owned by another user', async () => {
    prisma.items.findFirst.mockResolvedValue(null);

    await expect(service.findOne('item-1', 'user-2')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates and removes only owned items', async () => {
    prisma.items.update.mockResolvedValue({ item_id: 'item-1' });
    prisma.items.delete.mockResolvedValue({ item_id: 'item-1' });

    await service.update(
      'item-1',
      { brand: 'Wearo', ai_attributes: { fit: 'regular' } },
      'user-1',
    );
    await service.remove('item-1', 'user-1');

    expect(prisma.items.update).toHaveBeenCalledWith({
      where: { item_id: 'item-1', user_id: 'user-1' },
      data: {
        brand: 'Wearo',
        ai_attributes: { fit: 'regular' },
      },
    });
    expect(prisma.items.delete).toHaveBeenCalledWith({
      where: { item_id: 'item-1', user_id: 'user-1' },
    });
  });
});
