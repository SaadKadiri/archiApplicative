import { Injectable } from '@nestjs/common';
import { askDto, conversationDto } from './chat.dto';
import { ChatGPTService } from 'src/AI/ai.service';
import { map, of, switchMap } from 'rxjs';
import { AxiosResponse } from 'axios';
import * as uuid from 'uuid';
import { readFileSync } from 'fs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './chat.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    private readonly chatGPTService: ChatGPTService,
  ) {}

  async createConversation(conversationDto: conversationDto) {
    let userToken = '';
    if (conversationDto.token) {
      userToken = conversationDto.token;
    } else {
      userToken = uuid.v4();
    }

    const conversation = await this.conversationRepository.save({
      messages: [],
      ownerId: userToken,
    });

    return { token: userToken, conversationId: conversation.id };
  }

  getAllConversation(ownerId) {
    return this.conversationRepository.findBy({
      ownerId,
    });
  }

  getConversation(id) {
    return this.conversationRepository.findOneBy({
      id,
    });
  }

  async ask(askDto: askDto) {
    let userToken = '';
    if (askDto.token) {
      userToken = askDto.token;
    } else {
      userToken = uuid.v4();
    }

    const csvFile = readFileSync('uploads/csv/parameters.csv');
    const csvData = csvFile.toString();

    const conversation = await this.getConversation(askDto.conversationId);

    const response = await this.chatGPTService.generateResponse(
      askDto.question,
      csvData,
      conversation,
    );

    return response.pipe(
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
