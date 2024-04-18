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

  createConversation() {
    const token = localStorage.getItem('token');
    return this._chatBotApiService.createConversation(token ?? undefined).pipe(
      tap((response: { token: string; conversationId: number }) => {
        localStorage.setItem('token', response.token);
      })
    );
  }

  sendFile(form: FormData) {
    const token = localStorage.getItem('token');

    if (token) {
      form.append('token', token);
    }

    return this._chatBotApiService.sendFile(form).pipe(
      tap((response: { token: string; response: string }) => {
        localStorage.setItem('token', response.token);
      })
    );
  }
}
