import { IsDateString, IsUUID } from 'class-validator';

export class CreateScheduleDto {
  @IsDateString()
  planned_for!: string;

  @IsUUID()
  outfit_id!: string;
}
