import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { getSocket } from "../services/socket";

export type BreakroomNotification = { id: string; title: string; detail: string; createdAt: Date; read: boolean };
type NotificationContextValue = { notifications: BreakroomNotification[]; unreadCount: number; markAllRead: () => void };
const NotificationContext = createContext<NotificationContextValue>({ notifications: [], unreadCount: 0, markAllRead: () => undefined });

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<BreakroomNotification[]>([]);
  useEffect(() => {
    let attached = false;
    let socket: ReturnType<typeof getSocket> = null;
    const add = (title: string, detail: string) => setNotifications((current) => [{ id: `${Date.now()}-${Math.random()}`, title, detail, createdAt: new Date(), read: false }, ...current].slice(0, 30));
    const attach = () => {
      const nextSocket = getSocket();
      if (!nextSocket || attached) return;
      socket = nextSocket; attached = true;
      socket.on("paper_plane:received", () => add("Paper Plane landed", "A new note has arrived on your desk."));
      socket.on("inbox:updated", () => add("New Inbox conversation", "A Paper Plane was accepted and is ready to chat."));
      socket.on("chat:partner-left", () => add("Conversation removed", "The other person ended this private conversation."));
    };
    attach();
    const timer = setInterval(attach, 1000);
    return () => { clearInterval(timer); if (socket) { socket.off("paper_plane:received"); socket.off("inbox:updated"); socket.off("chat:partner-left"); } };
  }, []);
  const markAllRead = useCallback(() => setNotifications((current) => current.map((item) => item.read ? item : ({ ...item, read: true }))), []);
  return <NotificationContext.Provider value={{ notifications, unreadCount: notifications.filter((item) => !item.read).length, markAllRead }}>{children}</NotificationContext.Provider>;
}

export function useNotifications() { return useContext(NotificationContext); }
