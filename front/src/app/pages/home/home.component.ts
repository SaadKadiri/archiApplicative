import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ChatbotApiService } from '../../services/chatbot/chatbot.api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  title = 'ng17-boilerplate-app';

  constructor(private readonly _chatBotApiService: ChatbotApiService) {}

  chats: { sender: 'user' | 'bot'; content: string }[] = [];

  post(question: string) {
    this.chats.push({ sender: 'user', content: question });
    this._chatBotApiService.ask(question).subscribe(response => {
      this.chats.push({ sender: 'bot', content: response.response });
    });
  }
}
