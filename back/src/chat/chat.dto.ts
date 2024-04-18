export class askDto {
  question?: string;
  token?: string;
  conversationId: string;
  isFile = false;
}

export class conversationDto {
  token?: string;
}
