import { Module } from '@nestjs/common';
import { ChatGPTService } from './ai.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [ChatGPTService],
  exports: [ChatGPTService],
})
export class ChatGPTModule {}
