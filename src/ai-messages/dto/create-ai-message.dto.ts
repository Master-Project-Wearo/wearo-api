import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateAiMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20000)
  content!: string;

  @IsUUID()
  ai_conversation_id!: string;

  @IsOptional()
  @IsUUID()
  outfit_id?: string;
}
