import { IsOptional, IsString } from 'class-validator';

export class CreateAiConversationDto {
  @IsOptional()
  @IsString()
  title?: string;
}
