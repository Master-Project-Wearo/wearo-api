import { NotFoundException } from '@nestjs/common';
import {
  asPrismaService,
  createPrismaMock,
  type PrismaMock,
} from '../../test/support/prisma-mock';
import { SchedulesService } from './schedules.service';

describe('SchedulesService', () => {
  let prisma: PrismaMock;
  let service: SchedulesService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new SchedulesService(asPrismaService(prisma));
  });

  it('creates a schedule only for an owned outfit', async () => {
    prisma.outfits.findFirst.mockResolvedValue({ outfit_id: 'outfit-1' });
    prisma.schedules.create.mockResolvedValue({ schedule_id: 'schedule-1' });

    await service.create(
      {
        planned_for: '2026-07-01T10:00:00.000Z',
        outfit_id: 'outfit-1',
      },
      'user-1',
    );

    expect(prisma.outfits.findFirst).toHaveBeenCalledWith({
      where: { outfit_id: 'outfit-1', user_id: 'user-1' },
      select: { outfit_id: true },
    });
    expect(prisma.schedules.create).toHaveBeenCalledWith({
      data: {
        planned_for: new Date('2026-07-01T10:00:00.000Z'),
        outfit_id: 'outfit-1',
        user_id: 'user-1',
      },
    });
  });

  it('rejects a schedule for another users outfit', async () => {
    prisma.outfits.findFirst.mockResolvedValue(null);

    await expect(
      service.create(
        {
          planned_for: '2026-07-01T10:00:00.000Z',
          outfit_id: 'outfit-1',
        },
        'user-2',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prisma.schedules.create).not.toHaveBeenCalled();
  });

  it('lists and returns only owned schedules', async () => {
    prisma.schedules.findMany.mockResolvedValue([]);
    prisma.schedules.findFirst.mockResolvedValue({ schedule_id: 'schedule-1' });

    await service.findAll({ page: 1, limit: 10 }, 'user-1');
    await service.findOne('schedule-1', 'user-1');

    expect(prisma.schedules.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      where: { user_id: 'user-1' },
      orderBy: [{ planned_for: 'asc' }, { schedule_id: 'asc' }],
    });
    expect(prisma.schedules.findFirst).toHaveBeenCalledWith({
      where: { schedule_id: 'schedule-1', user_id: 'user-1' },
    });
  });

  it('hides another users schedule', async () => {
    prisma.schedules.findFirst.mockResolvedValue(null);

    await expect(
      service.findOne('schedule-1', 'user-2'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('validates a new outfit before updating and filters deletion by owner', async () => {
    prisma.outfits.findFirst.mockResolvedValue({ outfit_id: 'outfit-2' });
    prisma.schedules.update.mockResolvedValue({ schedule_id: 'schedule-1' });
    prisma.schedules.delete.mockResolvedValue({ schedule_id: 'schedule-1' });

    await service.update(
      'schedule-1',
      {
        planned_for: '2026-07-02T10:00:00.000Z',
        outfit_id: 'outfit-2',
      },
      'user-1',
    );
    await service.remove('schedule-1', 'user-1');

    expect(prisma.schedules.update).toHaveBeenCalledWith({
      where: { schedule_id: 'schedule-1', user_id: 'user-1' },
      data: {
        outfit_id: 'outfit-2',
        planned_for: new Date('2026-07-02T10:00:00.000Z'),
      },
    });
    expect(prisma.schedules.delete).toHaveBeenCalledWith({
      where: { schedule_id: 'schedule-1', user_id: 'user-1' },
    });
  });
});
