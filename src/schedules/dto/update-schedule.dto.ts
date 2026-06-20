import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class UpdateScheduleDto {
  @IsOptional()
  @IsDateString()
  planned_for?: string;

  @IsOptional()
  @IsUUID()
  outfit_id?: string;
}
