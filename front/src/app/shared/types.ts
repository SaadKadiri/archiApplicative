export type Conversation = {
  id: number;
  messages: {
    content: string;
    sender: 'user' | 'bot' | 'file';
  }[];
  ownerId: string;
};
