import { NotFoundException } from '@nestjs/common';
import {
  asPrismaService,
  createPrismaMock,
  type PrismaMock,
} from '../../test/support/prisma-mock';
import { OutfitItemsService } from './outfit-items.service';

describe('OutfitItemsService', () => {
  let prisma: PrismaMock;
  let service: OutfitItemsService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new OutfitItemsService(asPrismaService(prisma));
  });

  it('links only an owned outfit and owned item', async () => {
    prisma.outfits.findFirst.mockResolvedValue({ outfit_id: 'outfit-1' });
    prisma.items.findFirst.mockResolvedValue({ item_id: 'item-1' });
    prisma.outfit_items.create.mockResolvedValue({
      outfit_id: 'outfit-1',
      item_id: 'item-1',
    });

    await service.create(
      { outfit_id: 'outfit-1', item_id: 'item-1' },
      'user-1',
    );

    expect(prisma.outfit_items.create).toHaveBeenCalledWith({
      data: { outfit_id: 'outfit-1', item_id: 'item-1' },
    });
  });

  it('rejects a link when either resource is not owned', async () => {
    prisma.outfits.findFirst.mockResolvedValue(null);

    await expect(
      service.create({ outfit_id: 'outfit-1', item_id: 'item-1' }, 'user-2'),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prisma.items.findFirst).not.toHaveBeenCalled();
    expect(prisma.outfit_items.create).not.toHaveBeenCalled();
  });

  it('lists and returns links owned on both sides', async () => {
    prisma.outfit_items.findMany.mockResolvedValue([]);
    prisma.outfit_items.findFirst.mockResolvedValue({
      outfit_id: 'outfit-1',
      item_id: 'item-1',
    });

    await service.findAll({}, 'user-1');
    await service.findOne('outfit-1', 'item-1', 'user-1');

    const ownership = {
      outfits: { user_id: 'user-1' },
      items: { user_id: 'user-1' },
    };
    expect(prisma.outfit_items.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: ownership }),
    );
    expect(prisma.outfit_items.findFirst).toHaveBeenCalledWith({
      where: {
        outfit_id: 'outfit-1',
        item_id: 'item-1',
        ...ownership,
      },
    });
  });

  it('hides a link owned by another user', async () => {
    prisma.outfit_items.findFirst.mockResolvedValue(null);

    await expect(
      service.findOne('outfit-1', 'item-1', 'user-2'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('validates target ownership when changing a link', async () => {
    prisma.outfits.findFirst.mockResolvedValue({ outfit_id: 'outfit-2' });
    prisma.items.findFirst.mockResolvedValue({ item_id: 'item-2' });
    prisma.outfit_items.update.mockResolvedValue({
      outfit_id: 'outfit-2',
      item_id: 'item-2',
    });

    await service.update(
      'outfit-1',
      'item-1',
      { outfit_id: 'outfit-2', item_id: 'item-2' },
      'user-1',
    );

    expect(prisma.outfit_items.update).toHaveBeenCalledWith({
      where: {
        outfit_id_item_id: {
          outfit_id: 'outfit-1',
          item_id: 'item-1',
        },
        outfits: { user_id: 'user-1' },
        items: { user_id: 'user-1' },
      },
      data: {
        outfit_id: 'outfit-2',
        item_id: 'item-2',
      },
    });
  });

  it('removes only a link owned on both sides', async () => {
    prisma.outfit_items.delete.mockResolvedValue({
      outfit_id: 'outfit-1',
      item_id: 'item-1',
    });

    await service.remove('outfit-1', 'item-1', 'user-1');

    expect(prisma.outfit_items.delete).toHaveBeenCalledWith({
      where: {
        outfit_id_item_id: {
          outfit_id: 'outfit-1',
          item_id: 'item-1',
        },
        outfits: { user_id: 'user-1' },
        items: { user_id: 'user-1' },
      },
    });
  });
});
