import { IsOptional, IsString } from 'class-validator';

export class UpdateAiConversationDto {
  @IsOptional()
  @IsString()
  title?: string;
}
