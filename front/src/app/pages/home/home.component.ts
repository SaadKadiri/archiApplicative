import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ChatbotService } from '../../services/chatbot/chatbot.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  title = 'ng17-boilerplate-app';
  fileName = '';

  constructor(private readonly _chatBotService: ChatbotService) {}

  chats: { sender: 'user' | 'bot' | 'file'; content: string }[] = [];

  post(question: string) {
    this.chats.push({ sender: 'user', content: question });
    this._chatBotService.ask(question).subscribe(response => {
      this.chats.push({ sender: 'bot', content: response.response });
    });
  }

  onFileSelected(event: unknown) {
    const typedEvent: { target: { files: File[] } } = event as {
      target: { files: File[] };
    };

    const file: File = typedEvent.target.files[0];
    if (file) {
      this.fileName = file.name;
      this.chats.push({
        sender: 'file',
        content: 'genere une description depuis ce fichier: ' + file.name,
      });
      const formData = new FormData();
      formData.append('parameters', file);
      formData.append(
        'question',
        'genere une description depuis le fichier excel'
      );
      this._chatBotService.sendFile(formData).subscribe(response => {
        this.chats.push({ sender: 'bot', content: response.response });
      });
    }
  }
}
