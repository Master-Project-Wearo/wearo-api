import { NotFoundException } from '@nestjs/common';
import {
  asPrismaService,
  createPrismaMock,
  type PrismaMock,
} from '../../test/support/prisma-mock';
import { OutfitsService } from './outfits.service';

describe('OutfitsService', () => {
  let prisma: PrismaMock;
  let service: OutfitsService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new OutfitsService(asPrismaService(prisma));
  });

  it('creates an outfit for the authenticated user', async () => {
    prisma.outfits.create.mockResolvedValue({ outfit_id: 'outfit-1' });

    await service.create({ name: 'Office' }, 'user-1');

    expect(prisma.outfits.create).toHaveBeenCalledWith({
      data: { name: 'Office', user_id: 'user-1' },
    });
  });

  it('lists only owned outfits with search', async () => {
    prisma.outfits.findMany.mockResolvedValue([]);

    await service.findAll({ q: 'office' }, 'user-1');

    expect(prisma.outfits.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          user_id: 'user-1',
          OR: [
            { name: { contains: 'office', mode: 'insensitive' } },
            { theme: { contains: 'office', mode: 'insensitive' } },
          ],
        },
      }),
    );
  });

  it('returns an owned outfit and hides other users outfits', async () => {
    prisma.outfits.findFirst
      .mockResolvedValueOnce({ outfit_id: 'outfit-1' })
      .mockResolvedValueOnce(null);

    await expect(service.findOne('outfit-1', 'user-1')).resolves.toEqual({
      outfit_id: 'outfit-1',
    });
    await expect(service.findOne('outfit-1', 'user-2')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates and removes only owned outfits', async () => {
    prisma.outfits.update.mockResolvedValue({ outfit_id: 'outfit-1' });
    prisma.outfits.delete.mockResolvedValue({ outfit_id: 'outfit-1' });

    await service.update('outfit-1', { theme: 'formal' }, 'user-1');
    await service.remove('outfit-1', 'user-1');

    expect(prisma.outfits.update).toHaveBeenCalledWith({
      where: { outfit_id: 'outfit-1', user_id: 'user-1' },
      data: { theme: 'formal' },
    });
    expect(prisma.outfits.delete).toHaveBeenCalledWith({
      where: { outfit_id: 'outfit-1', user_id: 'user-1' },
    });
  });
});
