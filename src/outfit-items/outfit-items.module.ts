import { Module } from '@nestjs/common';
import { OutfitItemsService } from './outfit-items.service';
import { OutfitItemsController } from './outfit-items.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [OutfitItemsService],
  controllers: [OutfitItemsController],
})
export class OutfitItemsModule {}
