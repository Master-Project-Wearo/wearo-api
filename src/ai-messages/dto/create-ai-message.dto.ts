import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAiMessageDto {
  @IsString()
  content!: string;

  @IsString()
  role!: string;

  @IsDateString()
  created_at!: string;

  @IsUUID()
  ai_conversation_id!: string;

  @IsOptional()
  @IsUUID()
  outfit_id?: string;
}
