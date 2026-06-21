import { NotFoundException } from '@nestjs/common';
import {
  asPrismaService,
  createPrismaMock,
  type PrismaMock,
} from '../../test/support/prisma-mock';
import { TypesService } from './types.service';

describe('TypesService', () => {
  let prisma: PrismaMock;
  let service: TypesService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new TypesService(asPrismaService(prisma));
  });

  it('lists the shared catalogue with pagination and search', async () => {
    prisma.types.findMany.mockResolvedValue([]);

    await service.findAll({ page: 2, limit: 5, q: 'coat' });

    expect(prisma.types.findMany).toHaveBeenCalledWith({
      skip: 5,
      take: 5,
      orderBy: [{ name: 'asc' }, { type_id: 'asc' }],
      where: {
        OR: [
          { name: { contains: 'coat', mode: 'insensitive' } },
          {
            description: {
              contains: 'coat',
              mode: 'insensitive',
            },
          },
        ],
      },
    });
  });

  it('returns a type by id', async () => {
    prisma.types.findUnique.mockResolvedValue({ type_id: 'type-1' });

    await expect(service.findOne('type-1')).resolves.toEqual({
      type_id: 'type-1',
    });
  });

  it('rejects a missing type', async () => {
    prisma.types.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
