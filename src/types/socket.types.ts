export interface MessagePayload {
  receiverId: string;
  message: string;
  roomId?: string;
}

export interface MessageResponse {
  senderId: string;
  message: string;
  timestamp: string | Date;
  roomId?: string;
  [key: string]: any;
}

export interface TypingPayload {
  receiverId: string;
  isTyping: boolean;
}

export interface TypingResponse {
  userId: string;
  isTyping: boolean;
}

export interface NotificationPayload {
  type: string;
  title: string;
  body: string;
  [key: string]: any;
}

