import { api } from "./client";
const auth = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });
export type CultureMember = { id: string; anonymousUsername: string };
export type CultureOverview = { interests: string[]; myInterests: string[]; coffeeTopic: string | null; prompt: { date: string; text: string; mine: string | null; responses: { id: string; text: string; author: CultureMember }[] }; challenge: { key: string; text: string; responses: { id: string; text: string; author: CultureMember }[] }; kudos: { id: string; message: string; createdAt: string; sender: CultureMember; recipient: CultureMember }[] };
export async function getCulture(token: string) { return (await api.get("/api/culture", auth(token))).data as CultureOverview; }
export async function saveInterests(token: string, interests: string[]) { return (await api.put("/api/culture/interests", { interests }, auth(token))).data; }
export async function submitPrompt(token: string, text: string) { return (await api.post("/api/culture/prompt", { text }, auth(token))).data; }
export async function submitChallenge(token: string, text: string) { return (await api.post("/api/culture/challenge", { text }, auth(token))).data; }
export async function sendKudos(token: string, recipientId: string, message: string) { return (await api.post("/api/culture/kudos", { recipientId, message }, auth(token))).data; }
export async function joinCoffee(token: string, topic: string) { return (await api.post("/api/culture/coffee", { topic }, auth(token))).data as { matched: boolean; chat?: { id: string }; message?: string }; }
export async function leaveCoffee(token: string) { return (await api.delete("/api/culture/coffee", auth(token))).data; }
