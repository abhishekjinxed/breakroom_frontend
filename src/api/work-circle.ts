import { api } from "./client";

export type CircleMember = { id: string; anonymousUsername: string; bio: string | null; gender: string | null; age: number | null };
export type CircleRequest = { id: string; createdAt: string; member: CircleMember };
export type CircleConnection = { id: string; createdAt: string; member: CircleMember };
const auth = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });

export async function requestWorkCircleFromChat(token: string, chatId: string) { return (await api.post(`/api/work-circle/from-chat/${chatId}/request`, {}, auth(token))).data; }
export async function requestWorkCircle(token: string, userId: string, requestType: "PLANE" | "EMPTY_DESK") { return (await api.post(`/api/work-circle/${userId}/request`, { requestType }, auth(token))).data; }
export async function getWorkCircle(token: string) { return (await api.get("/api/work-circle", auth(token))).data as { requests: CircleRequest[]; connections: CircleConnection[] }; }
export async function respondToWorkCircle(token: string, id: string, accept: boolean) { return (await api.post(`/api/work-circle/${id}/respond`, { accept }, auth(token))).data; }
export async function openDirectChat(token: string, id: string) { return (await api.post(`/api/work-circle/${id}/direct-chat`, {}, auth(token))).data.chat as { id: string }; }
