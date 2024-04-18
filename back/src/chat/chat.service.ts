import { Injectable } from '@nestjs/common';
import { askDto } from './chat.dto';
import { ChatGPTService } from 'src/AI/ai.service';
import { map, of, switchMap } from 'rxjs';
import { AxiosResponse } from 'axios';
import * as uuid from 'uuid';

@Injectable()
export class ChatService {
  constructor(private readonly chatGPTService: ChatGPTService) {}

  ask(askDto: askDto) {
    let userToken = '';
    if (askDto.token) {
      userToken = askDto.token;
    } else {
      userToken = uuid.v4();
    }

    return this.chatGPTService.generateResponse(askDto.question).pipe(
      map(
        (response: AxiosResponse) => response.data.choices[0].message.content,
      ),
      switchMap((value) =>
        of({
          response: value,
          token: userToken,
        }),
      ),
    );
  }
}
