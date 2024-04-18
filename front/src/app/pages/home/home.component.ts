import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ChatbotService } from '../../services/chatbot/chatbot.service';
import { Conversation } from '../../shared/types';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  title = 'ng17-boilerplate-app';
  fileName = '';

  constructor(private readonly _chatBotService: ChatbotService) {}

  currentConversation: number | undefined;

  conversations: {
    id: number;
    messages: {
      content: string;
      sender: 'user' | 'bot' | 'file';
    }[];
    ownerId: string;
  }[] = [];

  chats: { sender: 'user' | 'bot' | 'file'; content: string }[] = [];

  ngOnInit() {
    this._chatBotService.getAllConversation()?.subscribe(data => {
      this.conversations = data;
    });
  }

  post(question: string) {
    this.chats.push({ sender: 'user', content: question });
    if (this.currentConversation) {
      this._chatBotService
        .ask(question, this.currentConversation.toString())
        .subscribe(response => {
          this.chats.push({ sender: 'bot', content: response.response });
        });
    } else {
      this._chatBotService.createConversation().subscribe(data => {
        this.conversations.push({
          id: data.conversationId,
          ownerId: data.token,
          messages: [],
        });
        this.currentConversation = data.conversationId;
        this._chatBotService
          .ask(question, this.currentConversation!.toString())
          .subscribe(response => {
            this.chats.push({ sender: 'bot', content: response.response });
          });
      });
    }
  }

  onFileSelected(event: unknown) {
    const typedEvent: { target: { files: File[] } } = event as {
      target: { files: File[] };
    };

    if (!this.currentConversation) {
      this._chatBotService.createConversation().subscribe(data => {
        this.conversations.push({
          id: data.conversationId,
          ownerId: data.token,
          messages: [],
        });
        this.currentConversation = data.conversationId;
        this.sendFile(typedEvent);
      });
    } else {
      this.sendFile(typedEvent);
    }
  }

  sendFile(typedEvent: { target: { files: File[] } }) {
    const file: File = typedEvent.target.files[0];
    if (file && this.currentConversation) {
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
      formData.append('conversationId', this.currentConversation.toString());
      this._chatBotService.sendFile(formData).subscribe(response => {
        this.chats.push({ sender: 'bot', content: response.response });
      });
    }
  }

  createConversation() {
    this._chatBotService.createConversation().subscribe(data => {
      this.conversations.push({
        id: data.conversationId,
        ownerId: data.token,
        messages: [],
      });
      this.currentConversation = data.conversationId;
    });
  }

  setConversation(conversation: Conversation) {
    this.chats = conversation.messages;
    this.currentConversation = conversation.id;
  }
}
