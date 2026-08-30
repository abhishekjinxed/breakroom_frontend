import { api } from "./client";
const auth = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });
export type InboxConversation = { id: string; member: { id: string; anonymousUsername: string }; latestMessage: { text: string; createdAt: string } | null; unreadCount: number; updatedAt: string };
export async function getInbox(token: string) { return (await api.get("/api/conversations", auth(token))).data.conversations as InboxConversation[]; }
export async function getDirectMessages(token: string, id: string) { return (await api.get(`/api/conversations/${id}/messages`, auth(token))).data.messages; }
export async function deleteDirectConversation(token: string, id: string) { return (await api.delete(`/api/conversations/${id}`, auth(token))).data; }
