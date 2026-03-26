import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateOutfitDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  calculated_price?: number;

  @IsOptional()
  @IsBoolean()
  is_favorite?: boolean;

  @IsDateString()
  created_at!: string;

  @IsOptional()
  @IsUUID()
  user_id?: string;
}
