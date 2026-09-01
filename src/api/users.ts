import { api } from "./client";

export type ProfilePhoto = { id: string; url: string; visibility: "PRIVATE" | "PUBLIC"; createdAt: string };

export type PublicProfile = {
  id: string;
  anonymousUsername: string;
  bio: string | null;
  gender: string | null;
  socialLink: string | null;
  createdAt: string;
  age: number | null;
  limitedProfile?: boolean;
  deskNotes: Array<{ id: string; text: string; createdAt: string; _count: { applauds: number; comments: number } }>;
  photos: ProfilePhoto[];
  photoAvailability: { total: number; visible: number };
};

export async function getPublicProfile(token: string, userId: string) {
  return (await api.get(`/api/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } })).data.user as PublicProfile;
}

export async function getMembers(token: string, query = "") {
  return (await api.get(`/api/users${query ? `?q=${encodeURIComponent(query)}` : ""}`, { headers: { Authorization: `Bearer ${token}` } })).data.users as PublicProfile[];
}

const auth = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });
export async function getMyProfilePhotos(token: string) { return (await api.get("/api/me/profile-photos", auth(token))).data.photos as ProfilePhoto[]; }
export async function addMyProfilePhoto(token: string, url: string, visibility: ProfilePhoto["visibility"] = "PRIVATE") { return (await api.post("/api/me/profile-photos", { url, visibility }, auth(token))).data.photo as ProfilePhoto; }
export async function updateMyProfilePhoto(token: string, photoId: string, visibility: ProfilePhoto["visibility"]) { return (await api.patch(`/api/me/profile-photos/${photoId}`, { visibility }, auth(token))).data; }
export async function deleteMyProfilePhoto(token: string, photoId: string) { return (await api.delete(`/api/me/profile-photos/${photoId}`, auth(token))).data; }
