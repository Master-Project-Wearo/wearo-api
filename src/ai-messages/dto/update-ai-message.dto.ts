import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateAiMessageDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsDateString()
  created_at?: string;

  @IsOptional()
  @IsUUID()
  ai_conversation_id?: string;

  @IsOptional()
  @IsUUID()
  outfit_id?: string;
}
