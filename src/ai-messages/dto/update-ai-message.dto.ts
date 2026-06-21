import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class UpdateAiMessageDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20000)
  content?: string;

  @IsOptional()
  @IsUUID()
  ai_conversation_id?: string;

  @IsOptional()
  @IsUUID()
  outfit_id?: string | null;
}
