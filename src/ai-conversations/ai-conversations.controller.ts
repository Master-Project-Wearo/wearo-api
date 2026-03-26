import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
} from '@nestjs/common';
import { CreateAiConversationDto } from './dto/create-ai-conversation.dto';
import { UpdateAiConversationDto } from './dto/update-ai-conversation.dto';
import { AiConversationsService } from './ai-conversations.service';

@Controller('ai-conversations')
export class AiConversationsController {
	constructor(private readonly aiConversationsService: AiConversationsService) {}

	@Post()
	create(@Body() data: CreateAiConversationDto) {
		return this.aiConversationsService.create(data);
	}

	@Get()
	findAll() {
		return this.aiConversationsService.findAll();
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
