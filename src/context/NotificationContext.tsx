import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { getNotifications, markNotificationsRead as markNotificationsReadRequest, StoredNotification } from "../api/notifications";
import { useAuth } from "./AuthContext";
import { getSocket } from "../services/socket";

export type BreakroomNotification = { id: string; title: string; detail: string; link?: string | null; createdAt: Date; read: boolean };
type NotificationContextValue = { notifications: BreakroomNotification[]; unreadCount: number; markAllRead: () => Promise<void> };
const NotificationContext = createContext<NotificationContextValue>({ notifications: [], unreadCount: 0, markAllRead: async () => undefined });

function toNotification(notification: StoredNotification): BreakroomNotification {
  return { id: notification.id, title: notification.title, detail: notification.detail, link: notification.link, createdAt: new Date(notification.createdAt), read: !!notification.readAt };
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<BreakroomNotification[]>([]);

  const addNotification = useCallback((notification: BreakroomNotification) => {
    setNotifications((current) => current.some((item) => item.id === notification.id) ? current : [notification, ...current].slice(0, 50));
  }, []);

  useEffect(() => {
    let active = true;
    if (!token) {
      setNotifications([]);
      return;
    }
    getNotifications(token)
      .then((items) => { if (active) setNotifications(items.map(toNotification)); })
      .catch(() => undefined);
    return () => { active = false; };
  }, [token]);

  useEffect(() => {
    let attached = false;
    let socket: ReturnType<typeof getSocket> = null;
    const add = (title: string, detail: string) => addNotification({ id: `${Date.now()}-${Math.random()}`, title, detail, createdAt: new Date(), read: false });
    const attach = () => {
      const nextSocket = getSocket();
      if (!nextSocket || attached) return;
      socket = nextSocket; attached = true;
      socket.on("paper_plane:received", () => add("Paper Plane landed", "A new note has arrived on your desk."));
      socket.on("inbox:updated", () => add("New Inbox conversation", "A Paper Plane was accepted and is ready to chat."));
      socket.on("chat:partner-left", () => add("Conversation removed", "The other person ended this private conversation."));
      socket.on("notification:created", (item: { id: string; title: string; detail: string; link: string | null; createdAt: string }) => addNotification({ ...item, createdAt: new Date(item.createdAt), read: false }));
    };
    attach();
    const timer = setInterval(attach, 1000);
    return () => { clearInterval(timer); if (socket) { socket.off("paper_plane:received"); socket.off("inbox:updated"); socket.off("chat:partner-left"); socket.off("notification:created"); } };
  }, [addNotification]);

  const markAllRead = useCallback(async () => {
    if (token) {
      try { await markNotificationsReadRequest(token); } catch { /* Still clear the local alert state for this session. */ }
    }
    setNotifications((current) => current.map((item) => item.read ? item : ({ ...item, read: true })));
  }, [token]);
  return <NotificationContext.Provider value={{ notifications, unreadCount: notifications.filter((item) => !item.read).length, markAllRead }}>{children}</NotificationContext.Provider>;
}

export function useNotifications() { return useContext(NotificationContext); }
