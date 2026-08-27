import { api } from "./client";

const auth = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });
export async function acceptTerms(token: string) { return (await api.post("/api/safety/terms/accept", {}, auth(token))).data.user; }
export async function reportContent(token: string, targetType: "PULSE" | "NOTE" | "MESSAGE" | "USER", targetId: string, reason: string) { return api.post("/api/safety/reports", { targetType, targetId, reason }, auth(token)); }
export async function blockUser(token: string, userId: string) { return api.post(`/api/safety/blocks/${userId}`, {}, auth(token)); }
export async function deleteAccount(token: string) { return api.delete("/api/safety/account", auth(token)); }
