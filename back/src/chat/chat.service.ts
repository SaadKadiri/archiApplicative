import { Injectable } from '@nestjs/common';
import { askDto } from './chat.dto';
import { ChatGPTService } from 'src/AI/ai.service';
import { map, of, switchMap } from 'rxjs';
import { AxiosResponse } from 'axios';
import * as uuid from 'uuid';
import { readFileSync } from 'fs';

@Injectable()
export class ChatService {
  constructor(private readonly chatGPTService: ChatGPTService) {}

  async ask(askDto: askDto) {
    let userToken = '';
    if (askDto.token) {
      userToken = askDto.token;
    } else {
      userToken = uuid.v4();
    }

    const csvFile = readFileSync('uploads/csv/parameters.csv');
    const csvData = csvFile.toString();

    console.log(askDto);
    console.log(csvData);

    return this.chatGPTService.generateResponse(askDto.question, csvData).pipe(
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
