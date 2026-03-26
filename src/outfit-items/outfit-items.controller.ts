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
import { CreateOutfitItemDto } from './dto/create-outfit-item.dto';
import { OutfitItemsService } from './outfit-items.service';
import { UpdateOutfitItemDto } from './dto/update-outfit-item.dto';

@Controller('outfit-items')
export class OutfitItemsController {
	constructor(private readonly outfitItemsService: OutfitItemsService) {}

	@Post()
	create(@Body() data: CreateOutfitItemDto) {
		return this.outfitItemsService.create(data);
	}

	@Get()
	findAll() {
		return this.outfitItemsService.findAll();
	}

	@Get(':outfitId/:itemId')
	findOne(
		@Param('outfitId', new ParseUUIDPipe()) outfitId: string,
		@Param('itemId', new ParseUUIDPipe()) itemId: string,
	) {
		return this.outfitItemsService.findOne(outfitId, itemId);
	}

	@Patch(':outfitId/:itemId')
	update(
		@Param('outfitId', new ParseUUIDPipe()) outfitId: string,
		@Param('itemId', new ParseUUIDPipe()) itemId: string,
		@Body() data: UpdateOutfitItemDto,
	) {
		return this.outfitItemsService.update(outfitId, itemId, data);
	}

	@Delete(':outfitId/:itemId')
	remove(
		@Param('outfitId', new ParseUUIDPipe()) outfitId: string,
		@Param('itemId', new ParseUUIDPipe()) itemId: string,
	) {
		return this.outfitItemsService.remove(outfitId, itemId);
	}
}
