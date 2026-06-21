import { PrismaService } from '../../src/prisma/prisma.service';

const modelMock = () => ({
  create: jest.fn(),
  delete: jest.fn(),
  findFirst: jest.fn(),
  findMany: jest.fn(),
  findUnique: jest.fn(),
  update: jest.fn(),
});

export function createPrismaMock() {
  return {
    users: modelMock(),
    types: modelMock(),
    items: modelMock(),
    outfits: modelMock(),
    schedules: modelMock(),
    outfit_items: modelMock(),
    ai_conversations: modelMock(),
    ai_messages: modelMock(),
  };
}

export type PrismaMock = ReturnType<typeof createPrismaMock>;

export function asPrismaService(mock: PrismaMock): PrismaService {
  return mock as unknown as PrismaService;
}
