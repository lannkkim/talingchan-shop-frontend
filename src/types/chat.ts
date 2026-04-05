import type { User } from "./auth";

export interface ChatParticipant {
  chat_participant_id: string;
  user_id: string;
  username?: string;
  shop_name?: string;
  image?: string;
  last_read_at?: string;
  joined_at: string;
  user?: User;
}

export interface ChatThread {
  chat_thread_id: string;
  order_id?: string;
  participants: ChatParticipant[];
  created_at: string;
  updated_at: string;
  last_message?: ChatMessage;
  unread_count?: number;
}

export interface ChatMessage {
  chat_message_id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  sender?: User;
}

export interface CreateThreadInput {
  participant_id: string;
  order_id?: string;
}

export interface SendMessageInput {
  body: string;
}

export interface WsEvent {
  type: string;
  payload: unknown;
}

export interface WsNewMessageEvent {
  type: "new_message";
  payload: ChatMessage;
}
