import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateOutfitDto {
  @IsOptional()
  @IsString()
  name?: string;

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
}
