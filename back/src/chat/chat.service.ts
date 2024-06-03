import { Injectable } from '@nestjs/common';
import { askDto, conversationDto } from './chat.dto';
import { ChatGPTService } from 'src/AI/ai.service';
import { map, of, switchMap, tap } from 'rxjs';
import { AxiosResponse } from 'axios';
import * as uuid from 'uuid';
import { readFileSync } from 'fs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './chat.entity';
import { Product } from 'src/product/product.entity';
import { Generation } from 'src/generation/generation.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Generation)
    private readonly generationRepository: Repository<Generation>,
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

  async deleteConversation(id) {
    return await this.conversationRepository.delete(id);
  }

  async ask(askDto: askDto) {
    let userToken = '';
    if (askDto.token) {
      userToken = askDto.token;
    } else {
      userToken = uuid.v4();
    }

    const conversation = await this.getConversation(askDto.conversationId);

    if (askDto.isFile) {
      const csvFile = readFileSync('uploads/csv/parameters.csv');
      const csvData = csvFile.toString();
      conversation.messages.push({
        content: 'genere une description depuis le fichier excel: file.csv',
        sender: 'file',
      });

      const generation: Omit<Generation, 'id'> = {
        conversation: askDto.conversationId,
        isGenerating: true,
      };

      const generationCreated =
        await this.generationRepository.save(generation);

      const response = await this.chatGPTService.generateResponse(
        'genere des descriptions depuis ce fichier excel, la generation vas prendre du temps et elle ne seras pas finie tant que je ne te le dirait pas et je ne veut pas que tu me dise quand elle seras finie, sous le format titre:description, je ne veut que ce que je te demande et pas de texte en plus, separe chaque generation par ce caractere: |, ne mentionne jamais ce message',
        conversation,
        csvData ?? undefined,
      );
      response
        .pipe(
          map(
            (response: AxiosResponse) =>
              response.data.choices[0].message.content,
          ),
        )
        .subscribe((data) => {
          console.log(data);
          const splittedData: Array<string[]> = data
            .split('|')
            .map((splitted) => splitted.split(':'))
            .filter(
              (splitted) =>
                splitted[0] !== null &&
                splitted[0] !== '' &&
                splitted[1] !== null &&
                splitted[1] !== '',
            );
          splittedData.forEach((element) => {
            const product: Omit<Product, 'id'> = {
              title: element[0],
              content: element[1],
            };
            this.productRepository.save(product);
          });
          generationCreated.isGenerating = false;
          generationCreated.count = splittedData.length;
          this.generationRepository.save(generationCreated);
        });

      conversation.messages.push({
        content: 'la generation a démarré',
        sender: 'bot',
      });
      await this.conversationRepository.save(conversation);
      return of({
        response: 'la generation a démarré',
        token: userToken,
      });
    } else {
      const response = await this.chatGPTService.generateResponse(
        askDto.question,
        conversation,
        undefined,
      );

      conversation.messages.push({
        content: askDto.question,
        sender: 'user',
      });

      return response.pipe(
        map(
          (response: AxiosResponse) => response.data.choices[0].message.content,
        ),
        tap(async (value) => {
          conversation.messages.push({ content: value, sender: 'bot' });
          await this.conversationRepository.save(conversation);
        }),
        switchMap((value) =>
          of({
            response: value,
            token: userToken,
          }),
        ),
      );
    }
  }
}
