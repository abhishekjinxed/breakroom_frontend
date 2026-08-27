import { api } from "./client";

export interface User {
  id: string;
  anonymousUsername: string;
  status: string;
  createdAt: string;
  lastActiveAt?: string;
  termsAcceptedAt?: string | null;
  bio?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  socialLink?: string | null;
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

export async function updateMyProfile(token: string, profile: Pick<User, "bio" | "dateOfBirth" | "gender" | "socialLink">) {
  const response = await api.put("/api/me", profile, { headers: { Authorization: `Bearer ${token}` } });
  return response.data.user as User;
}
