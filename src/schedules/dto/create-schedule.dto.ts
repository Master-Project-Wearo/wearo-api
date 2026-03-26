import { IsDateString, IsUUID } from 'class-validator';

export class CreateScheduleDto {
  @IsDateString()
  planned_for!: string;

  @IsDateString()
  created_at!: string;

  @IsUUID()
  user_id!: string;

  @IsUUID()
  outfit_id!: string;
}
