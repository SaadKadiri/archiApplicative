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

  chats: {
    sender: 'user' | 'bot' | 'file';
    content: string;
    isLoading: boolean;
  }[] = [];

  isLoading = false;

  ngOnInit() {
    this._chatBotService.getAllConversation()?.subscribe(data => {
      this.conversations = data;
    });
  }

  post(question: string) {
    this.chats.push({ sender: 'user', content: question, isLoading: false });
    this.chats.push({ sender: 'bot', content: '', isLoading: true });
    if (this.currentConversation) {
      this._chatBotService
        .ask(question, this.currentConversation.toString())
        .subscribe(response => {
          this.chats = this.chats.filter(chat => chat.isLoading === false);
          this.chats.push({
            sender: 'bot',
            content: response.response,
            isLoading: false,
          });
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
            this.chats = this.chats.filter(chat => chat.isLoading === false);
            this.chats.push({
              sender: 'bot',
              content: response.response,
              isLoading: false,
            });
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
        isLoading: false,
      });
      const formData = new FormData();
      formData.append('parameters', file);
      formData.append(
        'question',
        'genere une description depuis le fichier excel'
      );
      formData.append('conversationId', this.currentConversation.toString());
      this._chatBotService.sendFile(formData).subscribe(response => {
        this.chats.push({
          sender: 'bot',
          content: response.response,
          isLoading: false,
        });
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
      this.chats = [];
    });
  }

  deleteConversation(event: Event, conversation: Conversation) {
    event.stopPropagation();
    this._chatBotService.deleteConversation(conversation.id).subscribe(() => {
      if (this.currentConversation === conversation.id) {
        if (this.conversations.length > 0) {
          let indexToSwitch = this.conversations.indexOf(conversation);
          if (
            this.conversations.indexOf(conversation) ===
            this.conversations.length - 1
          ) {
            indexToSwitch -= 1;
          } else {
            indexToSwitch += 1;
          }
          this.setConversation(this.conversations[indexToSwitch]);
        } else {
          this.chats = [];
        }
      }
      this.conversations = this.conversations.filter(
        oldConv => conversation.id !== oldConv.id
      );
    });
  }

  setConversation(conversation: Conversation) {
    this.conversations;
    if (conversation.id !== this.currentConversation) {
      if (conversation?.messages) {
        this.chats = conversation.messages.map(chat => {
          return {
            ...chat,
            isLoading: false,
          };
        });
      } else {
        this.chats = [];
      }

      this.currentConversation = conversation.id;
    }
  }
}
