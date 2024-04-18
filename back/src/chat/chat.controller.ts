import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { ChatService } from './chat.service';
import { askDto } from './chat.dto';
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
}
