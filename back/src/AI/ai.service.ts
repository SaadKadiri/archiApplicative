import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { Conversation } from 'src/chat/chat.entity';

@Injectable()
export class ChatGPTService {
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.apiUrl =
      'https://az-dev-fc-epsi-cog-002-xfq.openai.azure.com/openai/deployments/gpt35/chat/completions?api-version=2024-02-01';
  }

  async generateResponse(
    prompt?: string,
    conversation?: Conversation,
    parameters?: string,
  ): Promise<Observable<AxiosResponse>> {
    const data = {
      messages: [
        {
          role: 'system',
          content:
            "tu est un bot permettant de generer des description de produit en fonction d'informations donner via le chat ou via un fichier excel, tu genere les description en fonction d'un titre et de plusieurs mots clé",
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
      data.messages.push({
        role: 'system',
        content:
          "l'utilisateur as envoyer un fichier excel et son contenu est:" +
          parameters,
      });
    }

    data.messages.push({
      role: 'user',
      content: prompt ?? 'lance la generation depuis le fichier excel',
    });

    const headers = {
      'Content-Type': 'application/json',
      'api-key': `${this.apiKey}`,
    };

    return this.httpService.post(this.apiUrl, data, { headers: headers });
  }
}
