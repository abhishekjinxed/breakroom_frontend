import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { getNotifications, markNotificationsRead as markNotificationsReadRequest, StoredNotification } from "../api/notifications";
import { useAuth } from "./AuthContext";
import { getSocket } from "../services/socket";
import { registerPushDevice, unregisterPushDevice } from "../api/push";
import { registerForAndroidPushNotifications } from "../services/push-notifications";

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
    if (!token) return;
    let mounted = true;
    let deviceToken: string | null = null;
    registerForAndroidPushNotifications()
      .then(async (nextToken) => {
        if (!mounted || !nextToken) return;
        deviceToken = nextToken;
        await registerPushDevice(token, nextToken);
      })
      .catch((error) => console.warn("PUSH REGISTRATION ERROR:", error));
    return () => {
      mounted = false;
      if (deviceToken) void unregisterPushDevice(token, deviceToken).catch(() => undefined);
    };
  }, [token]);

  useEffect(() => {
    let attached = false;
    let socket: ReturnType<typeof getSocket> = null;
    const attach = () => {
      const nextSocket = getSocket();
      if (!nextSocket || attached) return;
      socket = nextSocket; attached = true;
      // Domain sockets already refresh the desk, inbox, and open chat. Only
      // persist their corresponding notification event once, with its DB ID.
      socket.on("notification:created", (item: { id: string; title: string; detail: string; link: string | null; createdAt: string }) => addNotification({ ...item, createdAt: new Date(item.createdAt), read: false }));
    };
    attach();
    const timer = setInterval(attach, 1000);
    return () => { clearInterval(timer); if (socket) socket.off("notification:created"); };
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
