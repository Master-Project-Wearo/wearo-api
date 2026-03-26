import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class UpdateScheduleDto {
  @IsOptional()
  @IsDateString()
  planned_for?: string;

  @IsOptional()
  @IsDateString()
  created_at?: string;

  @IsOptional()
  @IsUUID()
  user_id?: string;

  @IsOptional()
  @IsUUID()
  outfit_id?: string;
}
