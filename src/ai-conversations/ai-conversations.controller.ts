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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
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
  create(@Body() data: CreateAiConversationDto, @CurrentUser() user: AuthUser) {
    return this.aiConversationsService.create(data, user.userId);
  }

  @Get()
  findAll(@Query() query: ListQueryDto, @CurrentUser() user: AuthUser) {
    return this.aiConversationsService.findAll(query, user.userId);
  }

  @Get(':aiConversationId')
  findOne(
    @Param('aiConversationId', new ParseUUIDPipe()) aiConversationId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.aiConversationsService.findOne(aiConversationId, user.userId);
  }

  @Patch(':aiConversationId')
  update(
    @Param('aiConversationId', new ParseUUIDPipe()) aiConversationId: string,
    @Body() data: UpdateAiConversationDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.aiConversationsService.update(
      aiConversationId,
      data,
      user.userId,
    );
  }

  @Delete(':aiConversationId')
  remove(
    @Param('aiConversationId', new ParseUUIDPipe()) aiConversationId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.aiConversationsService.remove(aiConversationId, user.userId);
  }
}
