import axiosInstance from "@/lib/axios";
import type {
  ChatThread,
  ChatMessage,
  CreateThreadInput,
  SendMessageInput,
} from "@/types/chat";

export const getMyThreads = async (): Promise<ChatThread[]> => {
  const res = await axiosInstance.get<ChatThread[]>("/api/v1/chat/threads");
  return res.data;
};

export const getOrCreateThread = async (input: CreateThreadInput): Promise<ChatThread> => {
  const res = await axiosInstance.post<ChatThread>("/api/v1/chat/threads", input);
  return res.data;
};

export const getThread = async (threadId: string): Promise<ChatThread> => {
  const res = await axiosInstance.get<ChatThread>(`/api/v1/chat/threads/${threadId}`);
  return res.data;
};

export const getMessages = async (
  threadId: string,
  params?: { limit?: number; offset?: number }
): Promise<ChatMessage[]> => {
  const res = await axiosInstance.get<ChatMessage[]>(
    `/api/v1/chat/threads/${threadId}/messages`,
    { params }
  );
  return res.data;
};

export const sendMessage = async (
  threadId: string,
  input: SendMessageInput
): Promise<ChatMessage> => {
  const res = await axiosInstance.post<ChatMessage>(
    `/api/v1/chat/threads/${threadId}/messages`,
    input
  );
  return res.data;
};

export const markRead = async (threadId: string): Promise<void> => {
  await axiosInstance.post(`/api/v1/chat/threads/${threadId}/read`);
};

export const getUnreadCount = async (): Promise<number> => {
  const res = await axiosInstance.get<{ count: number }>("/api/v1/chat/unread");
  return res.data.count;
};
