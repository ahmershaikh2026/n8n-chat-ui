export type MessageRole = 'user' | 'assistant' | 'error';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export interface SendMessagePayload {
  chatInput: string;
}

export interface N8nResponse {
  output?: string;
  message?: string;
  [key: string]: unknown;
}