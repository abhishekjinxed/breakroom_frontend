import { api } from "./client";

export type ChatMessage = { id: string; chatId?: string; senderId: string; text: string; createdAt: string };

export async function getChatMessages(token: string, chatId: string) {
  return (await api.get(`/api/chats/${chatId}/messages`, { headers: { Authorization: `Bearer ${token}` } })).data.messages as ChatMessage[];
}
