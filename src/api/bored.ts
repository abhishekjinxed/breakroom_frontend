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
