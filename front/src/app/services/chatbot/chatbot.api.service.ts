import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Conversation } from '../../shared/types';
@Injectable({
  providedIn: 'root',
})
export class ChatbotApiService {
  apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  ask(
    question: string,
    conversationId: string,
    token?: string
  ): Observable<{ token: string; response: string }> {
    return this.http.post<{ token: string; response: string }>(
      `${this.apiUrl}/chat`,
      token
        ? { token, question, conversationId }
        : { question, conversationId },
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      }
    );
  }

  createConversation(token: string | undefined) {
    return this.http.post<{ token: string; conversationId: number }>(
      `${this.apiUrl}/chat/createConversation`,
      token ? { token } : {},
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      }
    );
  }

  getAllConversations(token: string | undefined) {
    return this.http.get<Conversation[]>(
      `${this.apiUrl}/chat/getConversations/${token}`
    );
  }

  sendFile(form: FormData) {
    const params = new HttpParams();

    const options = {
      params: params,
      reportProgress: true,
    };

    return this.http.post<{ token: string; response: string }>(
      `${this.apiUrl}/chat`,
      form,
      options
    );
  }
}
