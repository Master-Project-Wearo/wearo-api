import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateAiConversationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsDateString()
  created_at?: string;

  @IsOptional()
  @IsUUID()
  user_id?: string;
}
