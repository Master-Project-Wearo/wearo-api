import { PartialType } from '@nestjs/swagger';
import { CreateOutfitItemDto } from './create-outfit-item.dto';

export class UpdateOutfitItemDto extends PartialType(CreateOutfitItemDto) {}
