import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class ChatbotApiService {
  apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  ask(
    question: string,
    token?: string
  ): Observable<{ token: string; response: string }> {
    return this.http.post<{ token: string; response: string }>(
      `${this.apiUrl}/chat`,
      token ? { token, question } : { question },
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      }
    );
  }
}
