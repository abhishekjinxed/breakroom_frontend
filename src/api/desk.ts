import { api } from "./client";

export async function getDeskQuote() { return (await api.get("/api/desk/quote")).data.quote as { text: string; author: string }; }
export async function getBreakroomPulse(token: string) { return (await api.get("/api/pulse", { headers: { Authorization: `Bearer ${token}` } })).data as { onlineCount: number }; }
