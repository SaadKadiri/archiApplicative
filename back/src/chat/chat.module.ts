import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGPTModule } from 'src/AI/ai.module';

@Module({
  imports: [ChatGPTModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
