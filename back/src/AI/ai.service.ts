import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { Conversation } from 'src/chat/chat.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Generation } from 'src/generation/generation.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChatGPTService {
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(
    @InjectRepository(Generation)
    private readonly generationRepository: Repository<Generation>,
    private readonly httpService: HttpService,
  ) {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.apiUrl =
      'https://epsi-instance-mmk.openai.azure.com/openai/deployments/gpt35/chat/completions?api-version=2024-02-01';
  }

  async generateResponse(
    prompt?: string,
    conversation?: Conversation,
    parameters?: string,
  ): Promise<Observable<AxiosResponse>> {
    const isGenerating = await this.generationRepository.findOneBy({
      isGenerating: true,
      conversation: conversation.id.toString(),
    });

    let context =
      "tu est un bot permettant de generer des description de produit en fonction d'informations donner via le chat ou via un fichier excel, tu genere les description en fonction d'un titre et de plusieurs mots clé";

    if (isGenerating) {
      context +=
        ", la generation est en cours, la generation de produit n'est pas finie, la generation n'est pas terminée";
    } else {
      context +=
        ", la generation n'est pas en cours, la generation est terminée, la generation de produit est finie";
    }

    const data = {
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: context,
        },
      ],
    };

    if (conversation) {
      conversation.messages.forEach((message) => {
        data.messages.push({
          role: message.sender === 'bot' ? 'system' : 'user',
          content: message.content,
        });
      });
    }

    if (parameters) {
      data.temperature = 1;
      data.messages.push({
        role: 'system',
        content:
          "l'utilisateur as envoyer un fichier excel et son contenu est:" +
          parameters,
      });
    }

    data.messages.push({
      role: parameters ? 'system' : 'user',
      content: prompt,
    });

    const headers = {
      'Content-Type': 'application/json',
      'api-key': `${this.apiKey}`,
    };

    return this.httpService.post(this.apiUrl, data, { headers: headers });
  }
}
