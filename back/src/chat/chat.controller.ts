import {
  Body,
  Param,
  Controller,
  Get,
  Post,
  UseInterceptors,
  Delete,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { askDto, conversationDto } from './chat.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('parameters', {
      storage: diskStorage({
        destination: './uploads/csv',
        filename: function (req, file, cb) {
          cb(null, file.fieldname + '.csv');
        },
      }),
    }),
  )
  ask(@Body() askDto: askDto) {
    return this.chatService.ask(askDto);
  }

  @Post('/conversations')
  createConversation(@Body() conversationDto: conversationDto) {
    return this.chatService.createConversation(conversationDto);
  }

  @Get('/conversations/:token')
  getAllConversations(@Param('token') token: string) {
    return this.chatService.getAllConversation(token);
  }

  @Delete('/conversations/:id')
  deleteConversation(@Param('id') id: string) {
    return this.chatService.deleteConversation(id);
  }
}
