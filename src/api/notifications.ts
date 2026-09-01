import { api } from "./client";

const auth = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });

export type StoredNotification = {
  id: string;
  title: string;
  detail: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

export async function getNotifications(token: string) {
  return (await api.get("/api/notifications", auth(token))).data.notifications as StoredNotification[];
}

export async function markNotificationsRead(token: string) {
  await api.post("/api/notifications/read", {}, auth(token));
}
