import { Injectable } from '@angular/core';
import { ChatbotApiService } from './chatbot.api.service';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatbotService {
  constructor(private readonly _chatBotApiService: ChatbotApiService) {}

  ask(question: string) {
    const token = localStorage.getItem('token');

    return this._chatBotApiService.ask(question, token ?? undefined).pipe(
      tap((response: { token: string; response: string }) => {
        localStorage.setItem('token', response.token);
      })
    );
  }
}
