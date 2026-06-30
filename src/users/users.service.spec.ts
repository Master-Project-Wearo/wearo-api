import { NotFoundException } from '@nestjs/common';
import {
  asPrismaService,
  createPrismaMock,
  type PrismaMock,
} from '../../test/support/prisma-mock';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let prisma: PrismaMock;
  let service: UsersService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new UsersService(asPrismaService(prisma));
  });

  it('returns the current user profile', async () => {
    prisma.users.findUnique.mockResolvedValue({ user_id: 'user-1' });

    await expect(service.findOne('user-1')).resolves.toEqual({
      user_id: 'user-1',
    });
    expect(prisma.users.findUnique).toHaveBeenCalledWith({
      where: { user_id: 'user-1' },
    });
  });

  it('rejects a missing profile', async () => {
    prisma.users.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates only the current user profile', async () => {
    prisma.users.findUnique.mockResolvedValue({ user_id: 'user-1' });
    prisma.users.update.mockResolvedValue({ user_id: 'user-1' });

    await service.update('user-1', { nickname: 'Ada' });

    expect(prisma.users.update).toHaveBeenCalledWith({
      where: { user_id: 'user-1' },
      data: { nickname: 'Ada' },
    });
  });
});
