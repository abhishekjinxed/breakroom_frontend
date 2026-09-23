import { api } from "./client";

const auth = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });

export type DeskStickyNote = {
  id: string;
  text: string;
  mood: "THOUGHT" | "WIN" | "ADVICE" | "QUESTION" | "RECOMMENDATION";
  pinnedAt?: string | null;
  createdAt: string;
  author: { id: string; anonymousUsername: string; publicAvatarUrl?: string | null; publicFlair?: string | null };
  _count: { applauds: number; meToos: number };
  applaudedByMe: boolean;
  meTooByMe: boolean;
  savedByMe: boolean;
  isUnavailable?: boolean;
  unavailableReason?: "MODERATOR" | "AUTHOR" | null;
  comments: Array<{ id: string; text: string; authorReply?: string | null; authorRepliedAt?: string | null; createdAt: string; isUnavailable?: boolean; unavailableReason?: "MODERATOR" | "AUTHOR" | null; author: { id: string; anonymousUsername: string; publicAvatarUrl?: string | null; publicFlair?: string | null } }>;
};

export async function getStickyNotes(token: string) { return (await api.get("/api/stickies", auth(token))).data.notes as DeskStickyNote[]; }
export async function getMyStickyNotes(token: string) { return (await api.get("/api/stickies/mine", auth(token))).data.notes as DeskStickyNote[]; }
export async function createStickyNote(token: string, text: string, mood: DeskStickyNote["mood"] = "THOUGHT") { return (await api.post("/api/stickies", { text, mood }, auth(token))).data.note as DeskStickyNote; }
export async function toggleStickyApplaud(token: string, noteId: string) { return (await api.post(`/api/stickies/${noteId}/applaud`, {}, auth(token))).data as { applauded: boolean; applauds: number }; }
export async function addStickyComment(token: string, noteId: string, text: string) { return (await api.post(`/api/stickies/${noteId}/comments`, { text }, auth(token))).data.comment as DeskStickyNote["comments"][number]; }
export async function replyToStickyComment(token: string, noteId: string, commentId: string, text: string) { return (await api.patch(`/api/stickies/${noteId}/comments/${commentId}/reply`, { text }, auth(token))).data.comment as DeskStickyNote["comments"][number]; }
export async function deleteStickyNote(token: string, noteId: string) { return (await api.delete(`/api/stickies/${noteId}`, auth(token))).data as { success: boolean }; }
export async function toggleStickyMeToo(token: string, noteId: string) { return (await api.post(`/api/stickies/${noteId}/me-too`, {}, auth(token))).data as { active: boolean; count: number }; }
export async function toggleStickySave(token: string, noteId: string) { return (await api.post(`/api/stickies/${noteId}/save`, {}, auth(token))).data as { active: boolean }; }
export async function pinStickyNote(token: string, noteId: string) { return (await api.post(`/api/stickies/${noteId}/pin`, {}, auth(token))).data as { success: boolean; pinned: boolean }; }
