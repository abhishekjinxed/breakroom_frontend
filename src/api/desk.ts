import { api } from "./client";

export async function getDeskQuote() { return (await api.get("/api/desk/quote")).data.quote as { text: string; author: string }; }
