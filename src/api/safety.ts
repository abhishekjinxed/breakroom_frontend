import { api } from "./client";

const auth = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });
export async function acceptTerms(token: string) { return (await api.post("/api/safety/terms/accept", {}, auth(token))).data.user; }
export async function reportContent(token: string, targetType: "PULSE" | "NOTE" | "MESSAGE" | "USER", targetId: string, reason: string) { return api.post("/api/safety/reports", { targetType, targetId, reason }, auth(token)); }
export async function blockUser(token: string, userId: string) { return api.post(`/api/safety/blocks/${userId}`, {}, auth(token)); }
export async function deleteAccount(token: string) { return (await api.delete("/api/safety/account", auth(token))).data as { success: boolean }; }

export type ModerationReport = {
  id: string;
  targetType: "PULSE" | "NOTE" | "MESSAGE" | "USER";
  targetId: string;
  reason: string;
  details: string | null;
  status: "OPEN" | "REVIEWED" | "DISMISSED";
  createdAt: string;
  reviewedAt: string | null;
  reporter: { id: string; anonymousUsername: string };
  target: { label: string; text: string; author?: string };
};

export async function getModeratorStatus(token: string) { return (await api.get("/api/safety/moderation/status", auth(token))).data.isModerator as boolean; }
export async function getModerationReports(token: string) { return (await api.get("/api/safety/moderation/reports", auth(token))).data.reports as ModerationReport[]; }
export async function resolveModerationReport(token: string, reportId: string, status: "REVIEWED" | "DISMISSED") { return (await api.patch(`/api/safety/moderation/reports/${reportId}`, { status }, auth(token))).data; }
