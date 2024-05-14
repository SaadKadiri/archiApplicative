import { Injectable } from '@nestjs/common';
import { askDto, conversationDto } from './chat.dto';
import { ChatGPTService } from 'src/AI/ai.service';
import { forkJoin, map, of, switchMap, tap } from 'rxjs';
import { AxiosResponse } from 'axios';
import * as uuid from 'uuid';
import { readFileSync } from 'fs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './chat.entity';
import { parse } from 'csv-parse';

type product = {
  title: string;
  keywords: string;
};

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

  async deleteConversation(id) {
    return await this.conversationRepository.delete(id);
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

    let csvData = undefined;
    const conversation = await this.getConversation(askDto.conversationId);

    if (askDto.isFile) {
      const csvFile = readFileSync('uploads/csv/parameters.csv');
      const headers = ['title', 'keywords'];
      parse(
        csvFile,
        {
          delimiter: ',',
          columns: headers,
        },
        (error, result: product[]) => {
          if (error) {
            console.error(error);
          }
          const querys = result.map(async (product) => {
            return (
              await this.chatGPTService.generateResponse(
                "genere la description d'un produit ayant le titre: " +
                  product.title +
                  ' et qui comporte ces mots cles: ' +
                  product.keywords,
              )
            ).pipe(
              tap((response) => {
                console.log(response.data);
              }),
            );
          });
          forkJoin(querys);
        },
      );
      // conversation.messages.push({
      //   content: 'lance la generation depuis le fichier excel: file.csv',
      //   sender: 'file',
      // });
      //await this.conversationRepository.save(conversation);
    } else {
      conversation.messages.push({ content: askDto.question, sender: 'user' });
      //await this.conversationRepository.save(conversation);
    }

    // const response = await this.chatGPTService.generateResponse(
    //   askDto.question,
    //   conversation,
    //   csvData ?? undefined,
    // );

    // return response.pipe(
    //   map(
    //     (response: AxiosResponse) => response.data.choices[0].message.content,
    //   ),
    //   tap(async (value) => {
    //     conversation.messages.push({ content: value, sender: 'bot' });
    //     await this.conversationRepository.save(conversation);
    //   }),
    //   switchMap((value) =>
    //     of({
    //       response: value,
    //       token: userToken,
    //     }),
    //   ),
    // );
  }
}
