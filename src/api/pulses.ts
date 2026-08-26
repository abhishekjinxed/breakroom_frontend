import { api } from "./client";

export type MediaType = "IMAGE" | "VIDEO";
export type WorkPulse = { id: string; text: string; mediaUrl?: string | null; mediaType?: MediaType | null; createdAt: string; author: { id: string; anonymousUsername: string }; _count: { applauds: number }; applaudedByMe: boolean; notes: Array<{ id: string; text: string; author: { id: string; anonymousUsername: string } }> };
const auth = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });
export async function getPulses(token: string, briefs = false) { return (await api.get(`/api/pulses${briefs ? "?briefs=true" : ""}`, auth(token))).data.pulses as WorkPulse[]; }
export async function createPulse(token: string, data: { text: string; mediaUrl?: string; mediaType?: MediaType; isBreakBrief?: boolean }) { return (await api.post("/api/pulses", data, auth(token))).data.pulse as WorkPulse; }
export async function toggleApplaud(token: string, pulseId: string) { return (await api.post(`/api/pulses/${pulseId}/applaud`, {}, auth(token))).data; }
export async function addNote(token: string, pulseId: string, text: string) { return (await api.post(`/api/pulses/${pulseId}/notes`, { text }, auth(token))).data.note; }
