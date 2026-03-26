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
import { CreateAiMessageDto } from './dto/create-ai-message.dto';
import { UpdateAiMessageDto } from './dto/update-ai-message.dto';
import { AiMessagesService } from './ai-messages.service';

@Controller('ai-messages')
export class AiMessagesController {
  constructor(private readonly aiMessagesService: AiMessagesService) {}

  @Post()
  create(@Body() data: CreateAiMessageDto, @CurrentUser() user: AuthUser) {
    return this.aiMessagesService.create(data, user.userId);
  }

  @Get()
  findAll(@Query() query: ListQueryDto, @CurrentUser() user: AuthUser) {
    return this.aiMessagesService.findAll(query, user.userId);
  }

  @Get(':aiMessageId')
  findOne(
    @Param('aiMessageId', new ParseUUIDPipe()) aiMessageId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.aiMessagesService.findOne(aiMessageId, user.userId);
  }

  @Patch(':aiMessageId')
  update(
    @Param('aiMessageId', new ParseUUIDPipe()) aiMessageId: string,
    @Body() data: UpdateAiMessageDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.aiMessagesService.update(aiMessageId, data, user.userId);
  }

  @Delete(':aiMessageId')
  remove(
    @Param('aiMessageId', new ParseUUIDPipe()) aiMessageId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.aiMessagesService.remove(aiMessageId, user.userId);
  }
}
