import { Injectable } from '@nestjs/common';
import { askDto } from './chat.dto';
import { ChatGPTService } from 'src/AI/ai.service';
import { map } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class ChatService {
  constructor(private readonly chatGPTService: ChatGPTService) {}

  ask(askDto: askDto) {
    return this.chatGPTService
      .generateResponse(askDto.question)
      .pipe(
        map(
          (response: AxiosResponse) => response.data.choices[0].message.content,
        ),
      );
  }
}
