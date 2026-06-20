import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateItemDto {
  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsString()
  web_url?: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  ai_description?: string;

  @IsOptional()
  @IsObject()
  ai_attributes?: Record<string, unknown>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsArray()
  @IsString({ each: true })
  colors!: string[];

  @IsOptional()
  @IsBoolean()
  is_favorite?: boolean;

  @IsOptional()
  @IsUUID()
  type_id?: string;
}
