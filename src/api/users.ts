import { api } from "./client";

export type PublicProfile = {
  id: string;
  anonymousUsername: string;
  bio: string | null;
  gender: string | null;
  socialLink: string | null;
  createdAt: string;
  age: number | null;
};

export async function getPublicProfile(token: string, userId: string) {
  return (await api.get(`/api/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } })).data.user as PublicProfile;
}

export async function getMembers(token: string, query = "") {
  return (await api.get(`/api/users${query ? `?q=${encodeURIComponent(query)}` : ""}`, { headers: { Authorization: `Bearer ${token}` } })).data.users as PublicProfile[];
}
