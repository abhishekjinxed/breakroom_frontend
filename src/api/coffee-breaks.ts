import { api } from "./client";

const auth = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });

export type CoffeeParticipant = {
  id: string;
  anonymousUsername: string;
  joinedAt: string;
  hasLeft: boolean;
};

export type CoffeeMessage = {
  id: string;
  text: string;
  createdAt: string;
  sender: { id: string; anonymousUsername: string };
};

export type CoffeeBreakRoom = {
  id: string;
  status: "WAITING" | "ACTIVE" | "ENDED" | "CANCELLED";
  prompt: string;
  createdAt: string;
  startedAt: string | null;
  endsAt: string | null;
  endedAt: string | null;
  minParticipants: number;
  maxParticipants: number;
  canChat: boolean;
  participants: CoffeeParticipant[];
  messages: CoffeeMessage[];
};

export async function getCoffeeBreakAvailability(token: string) {
  return (await api.get("/api/coffee-breaks/availability", auth(token))).data as { waiting: number; neededToStart: number };
}

export async function getCurrentCoffeeBreak(token: string) {
  return (await api.get("/api/coffee-breaks/current", auth(token))).data as { room: CoffeeBreakRoom | null };
}

export async function joinCoffeeBreak(token: string) {
  return (await api.post("/api/coffee-breaks/join", {}, auth(token))).data as { room: CoffeeBreakRoom };
}

export async function leaveCoffeeBreak(token: string) {
  return (await api.delete("/api/coffee-breaks/leave", auth(token))).data as { success: boolean };
}

export async function sendCoffeeBreakMessage(token: string, roomId: string, text: string) {
  return (await api.post(`/api/coffee-breaks/${roomId}/messages`, { text }, auth(token))).data as { message: CoffeeMessage };
}
