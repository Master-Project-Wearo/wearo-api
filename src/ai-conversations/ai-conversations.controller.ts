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
import { CreateAiConversationDto } from './dto/create-ai-conversation.dto';
import { UpdateAiConversationDto } from './dto/update-ai-conversation.dto';
import { AiConversationsService } from './ai-conversations.service';

@Controller('ai-conversations')
export class AiConversationsController {
  constructor(
    private readonly aiConversationsService: AiConversationsService,
  ) {}

  @Post()
  create(@Body() data: CreateAiConversationDto) {
    return this.aiConversationsService.create(data);
  }

  @Get()
  findAll(@Query() query: ListQueryDto) {
    return this.aiConversationsService.findAll(query);
  }

  @Get(':aiConversationId')
  findOne(
    @Param('aiConversationId', new ParseUUIDPipe()) aiConversationId: string,
  ) {
    return this.aiConversationsService.findOne(aiConversationId);
  }

  @Patch(':aiConversationId')
  update(
    @Param('aiConversationId', new ParseUUIDPipe()) aiConversationId: string,
    @Body() data: UpdateAiConversationDto,
  ) {
    return this.aiConversationsService.update(aiConversationId, data);
  }

  @Delete(':aiConversationId')
  remove(
    @Param('aiConversationId', new ParseUUIDPipe()) aiConversationId: string,
  ) {
    return this.aiConversationsService.remove(aiConversationId);
  }
}
