import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(2048)
  profile_picture_url?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(2048)
  background_image_url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nickname?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
