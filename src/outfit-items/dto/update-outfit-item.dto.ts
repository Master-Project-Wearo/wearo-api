import { IsOptional, IsUUID } from 'class-validator';

export class UpdateOutfitItemDto {
  @IsOptional()
  @IsUUID()
  outfit_id?: string;

  @IsOptional()
  @IsUUID()
  item_id?: string;
}
