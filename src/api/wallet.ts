import { api } from "./client";

export type PaisaWallet = { balance: number; currency: "Paisa"; paperPlaneCost: number };

export async function getWallet(token: string) {
  return (await api.get("/api/wallet", { headers: { Authorization: `Bearer ${token}` } })).data as { success: true } & PaisaWallet;
}
