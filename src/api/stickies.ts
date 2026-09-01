import { api } from "./client";

const auth = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });

export type DeskStickyNote = {
  id: string;
  text: string;
  createdAt: string;
  author: { id: string; anonymousUsername: string };
  _count: { applauds: number };
  applaudedByMe: boolean;
  comments: Array<{ id: string; text: string; authorReply?: string | null; authorRepliedAt?: string | null; createdAt: string; author: { id: string; anonymousUsername: string } }>;
};

export async function getStickyNotes(token: string) { return (await api.get("/api/stickies", auth(token))).data.notes as DeskStickyNote[]; }
export async function createStickyNote(token: string, text: string) { return (await api.post("/api/stickies", { text }, auth(token))).data.note as DeskStickyNote; }
export async function toggleStickyApplaud(token: string, noteId: string) { return (await api.post(`/api/stickies/${noteId}/applaud`, {}, auth(token))).data as { applauded: boolean; applauds: number }; }
export async function addStickyComment(token: string, noteId: string, text: string) { return (await api.post(`/api/stickies/${noteId}/comments`, { text }, auth(token))).data.comment as DeskStickyNote["comments"][number]; }
export async function replyToStickyComment(token: string, noteId: string, commentId: string, text: string) { return (await api.patch(`/api/stickies/${noteId}/comments/${commentId}/reply`, { text }, auth(token))).data.comment as DeskStickyNote["comments"][number]; }
export async function deleteStickyNote(token: string, noteId: string) { return (await api.delete(`/api/stickies/${noteId}`, auth(token))).data as { success: boolean }; }
