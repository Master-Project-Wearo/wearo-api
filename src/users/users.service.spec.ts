import { NotFoundException } from '@nestjs/common';
import {
  asPrismaService,
  createPrismaMock,
  type PrismaMock,
} from '../../test/support/prisma-mock';
import { SupabaseAuthService } from './supabase-auth.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let prisma: PrismaMock;
  let supabaseAuth: jest.Mocked<Pick<SupabaseAuthService, 'updateNickname'>>;
  let service: UsersService;

  beforeEach(() => {
    prisma = createPrismaMock();
    supabaseAuth = {
      updateNickname: jest.fn().mockResolvedValue(undefined),
    };
    service = new UsersService(
      asPrismaService(prisma),
      supabaseAuth as unknown as SupabaseAuthService,
    );
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

  it('updates only public profile fields when nickname is absent', async () => {
    prisma.users.findUnique.mockResolvedValueOnce({ user_id: 'user-1' });
    prisma.users.update.mockResolvedValue({ user_id: 'user-1' });

    await service.update('user-1', { description: 'Hello' });

    expect(prisma.users.update).toHaveBeenCalledWith({
      where: { user_id: 'user-1' },
      data: { description: 'Hello' },
    });
    expect(supabaseAuth.updateNickname).not.toHaveBeenCalled();
  });

  it('syncs nickname to Supabase Auth and updates only public profile fields directly', async () => {
    prisma.users.findUnique.mockResolvedValueOnce({
      user_id: 'user-1',
      nickname: 'Old',
    });
    prisma.users.update.mockResolvedValue({ user_id: 'user-1' });

    await service.update(
      'user-1',
      { nickname: 'Ada', description: 'Hello' },
      'Bearer user-token',
    );

    expect(supabaseAuth.updateNickname).toHaveBeenCalledWith(
      'Bearer user-token',
      'Ada',
    );
    expect(prisma.users.update).toHaveBeenCalledWith({
      where: { user_id: 'user-1' },
      data: { description: 'Hello' },
    });
  });

  it('returns the refreshed profile when only nickname changes', async () => {
    prisma.users.findUnique
      .mockResolvedValueOnce({ user_id: 'user-1', nickname: 'Old' })
      .mockResolvedValueOnce({ user_id: 'user-1', nickname: 'Ada' });

    await expect(
      service.update('user-1', { nickname: 'Ada' }, 'Bearer user-token'),
    ).resolves.toEqual({ user_id: 'user-1', nickname: 'Ada' });
    expect(supabaseAuth.updateNickname).toHaveBeenCalledWith(
      'Bearer user-token',
      'Ada',
    );
    expect(prisma.users.update).not.toHaveBeenCalled();
  });
});
