import { api } from "./client";
const auth = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });
export type InboxConversation = { id: string; member: { id: string; anonymousUsername: string }; latestMessage: { text: string; createdAt: string } | null; unreadCount: number; updatedAt: string };
export type DirectConversation = { messages: Array<{ id: string; chatId: string; senderId: string; text: string; createdAt: string; readAt?: string | null }>; profileSharing: { isSharingMyProfile: boolean; canViewMemberProfile: boolean; memberId: string | null } };
export async function getInbox(token: string) { return (await api.get("/api/conversations", auth(token))).data.conversations as InboxConversation[]; }
export async function getDirectConversation(token: string, id: string) { return (await api.get(`/api/conversations/${id}/messages`, auth(token))).data as DirectConversation; }
export async function deleteDirectConversation(token: string, id: string) { return (await api.delete(`/api/conversations/${id}`, auth(token))).data; }
export async function updateProfileSharing(token: string, id: string, share: boolean) { return (await api.patch(`/api/conversations/${id}/profile-sharing`, { share }, auth(token))).data as { success: boolean; isSharingMyProfile: boolean }; }
