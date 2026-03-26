import { IsOptional, IsString } from 'class-validator';

export class CreateTypeDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
