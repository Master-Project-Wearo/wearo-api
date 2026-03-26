import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAiConversationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsDateString()
  created_at!: string;

  @IsUUID()
  user_id!: string;
}
