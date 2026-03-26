import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { CreateAiMessageDto } from './dto/create-ai-message.dto';
import { UpdateAiMessageDto } from './dto/update-ai-message.dto';
import { AiMessagesService } from './ai-messages.service';

@Controller('ai-messages')
export class AiMessagesController {
  constructor(private readonly aiMessagesService: AiMessagesService) {}

  @Post()
  create(@Body() data: CreateAiMessageDto) {
    return this.aiMessagesService.create(data);
  }

  @Get()
  findAll(@Query() query: ListQueryDto) {
    return this.aiMessagesService.findAll(query);
  }

  @Get(':aiMessageId')
  findOne(@Param('aiMessageId', new ParseUUIDPipe()) aiMessageId: string) {
    return this.aiMessagesService.findOne(aiMessageId);
  }

  @Patch(':aiMessageId')
  update(
    @Param('aiMessageId', new ParseUUIDPipe()) aiMessageId: string,
    @Body() data: UpdateAiMessageDto,
  ) {
    return this.aiMessagesService.update(aiMessageId, data);
  }

  @Delete(':aiMessageId')
  remove(@Param('aiMessageId', new ParseUUIDPipe()) aiMessageId: string) {
    return this.aiMessagesService.remove(aiMessageId);
  }
}
