import { IsUUID } from 'class-validator';

export class CreateOutfitItemDto {
  @IsUUID()
  outfit_id!: string;

  @IsUUID()
  item_id!: string;
}
