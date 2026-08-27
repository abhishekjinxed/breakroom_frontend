import { api } from "./client";

export interface User {
  id: string;
  anonymousUsername: string;
  status: string;
  createdAt: string;
  lastActiveAt?: string;
  termsAcceptedAt?: string | null;
}

export async function anonymousLogin() {
  const response = await api.post("/api/auth/anonymous");

  return response.data;
}

export async function googleLogin(idToken: string) {
  const response = await api.post("/api/auth/google", { idToken });
  return response.data;
}

export async function getMe(token: string) {
  const response = await api.get("/api/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
