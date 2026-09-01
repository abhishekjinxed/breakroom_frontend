import { api } from "./client";

export interface JoinBoredResult {
  success: boolean;
  status?: string;
  matched?: boolean;
  chat?: {
    id: string;
    otherUser?: {
      id: string;
      anonymousUsername: string;
    };
  };
  message?: string;
}

export interface PaperPlaneInvite {
  id: string;
  message: string;
  isCharter: boolean;
  expiresAt: string;
  sender: { id: string; anonymousUsername: string };
}

export async function joinBored(token: string): Promise<JoinBoredResult> {
  const response = await api.post(
    "/api/bored/join",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
}

export async function leaveBored(token: string) {
  const response = await api.post(
    "/api/bored/leave",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
}

export async function stopLooking(token: string) {
  const response = await api.post(
    "/api/bored/stop",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
}

const auth = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });

export async function sendPaperPlane(token: string, message: string) {
  return (await api.post("/api/bored/paper-plane", { message }, auth(token))).data as { success: true; invite: Pick<PaperPlaneInvite, "id" | "message" | "expiresAt">; wallet: { balance: number; currency: "Paisa"; paperPlaneCost: number } };
}

export async function sendCharterPaperPlane(token: string, recipientId: string) {
  return (await api.post(`/api/bored/paper-plane/charter/${recipientId}`, {}, auth(token))).data as { success: true; invite: Pick<PaperPlaneInvite, "id" | "message" | "isCharter" | "expiresAt">; wallet: { balance: number; currency: "Paisa"; paperPlaneCost: number } };
}

export async function getPendingPaperPlanes(token: string) {
  return (await api.get("/api/bored/paper-plane", auth(token))).data as { success: true; invites: PaperPlaneInvite[] };
}

export async function respondToPaperPlane(token: string, inviteId: string, accept: boolean) {
  return (await api.post(`/api/bored/paper-plane/${inviteId}/respond`, { accept }, auth(token))).data as { success: true; accepted: boolean; chatId?: string };
}
