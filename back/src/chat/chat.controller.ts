import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { askDto } from './chat.dto';

@Controller('/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  ask(@Body() askDto: askDto) {
    return this.chatService.ask(askDto);
  }
}
