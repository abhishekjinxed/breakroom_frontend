import { router, usePathname } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getInbox } from "../api/inbox";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { useNotifications } from "../context/NotificationContext";
import { getSocket } from "../services/socket";

const items = [
  { label: "home", icon: "⌂", route: "/" },
  { label: "inbox", icon: "✉", route: "/inbox" },
  { label: "alerts", icon: "!", route: "/notifications" },
] as const;

export function AppBottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { token } = useAuth();
  const { unreadCount } = useNotifications();
  const [inboxUnreadCount, setInboxUnreadCount] = useState(0);

  const refreshInboxUnreadCount = useCallback(async () => {
    if (!token) {
      setInboxUnreadCount(0);
      return;
    }

    try {
      const conversations = await getInbox(token);
      setInboxUnreadCount(conversations.reduce((total, conversation) => total + conversation.unreadCount, 0));
    } catch {
      // Keep the last known count while the device is offline or reconnecting.
    }
  }, [token]);

  useEffect(() => {
    let socket = getSocket();
    let attached = false;

    const attachSocketListeners = () => {
      if (!socket || attached) return;
      socket.on("inbox:updated", refreshInboxUnreadCount);
      socket.on("chat:message", refreshInboxUnreadCount);
      socket.on("chat:partner-left", refreshInboxUnreadCount);
      attached = true;
    };

    refreshInboxUnreadCount();
    attachSocketListeners();
    const refreshInterval = setInterval(refreshInboxUnreadCount, 15000);
    const socketInterval = setInterval(() => {
      socket = getSocket();
      attachSocketListeners();
    }, 1000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(socketInterval);
      if (socket && attached) {
        socket.off("inbox:updated", refreshInboxUnreadCount);
        socket.off("chat:message", refreshInboxUnreadCount);
        socket.off("chat:partner-left", refreshInboxUnreadCount);
      }
    };
  }, [refreshInboxUnreadCount]);

  return <View style={[styles.shell, { backgroundColor: colors.surface, borderColor: colors.border }]}>
    {items.map((item) => {
      const active = item.route === "/" ? pathname === "/" : pathname.startsWith(item.route);
      const label = t(item.label as any);
      const badgeCount = item.route === "/inbox" ? inboxUnreadCount : item.route === "/notifications" ? unreadCount : 0;
      const badgeLabel = badgeCount > 9 ? "9+" : String(badgeCount);
      return <TouchableOpacity key={item.route} accessibilityRole="button" accessibilityLabel={badgeCount ? `${label}, ${badgeCount} unread` : label} style={styles.item} onPress={() => {
        if (item.route === "/inbox") refreshInboxUnreadCount();
        router.replace(item.route as any);
      }}>
        <View style={[styles.iconWrap, item.route === "/notifications" && styles.alertIconWrap, { borderColor: active ? colors.teal : colors.border }]}>
          <Text style={[styles.icon, { color: active ? colors.teal : colors.muted }]}>{item.icon}</Text>
        </View>
        {badgeCount > 0 && <View style={[styles.badge, { backgroundColor: colors.danger, borderColor: colors.surface }]}><Text style={styles.badgeText}>{badgeLabel}</Text></View>}
        <Text style={[styles.label, { color: active ? colors.teal : colors.muted }]}>{label}</Text>
      </TouchableOpacity>;
    })}
  </View>;
}

const styles = StyleSheet.create({
  shell: { minHeight: 66, flexDirection: "row", borderTopWidth: 1, paddingHorizontal: 8, paddingTop: 8, paddingBottom: 6 },
  item: { flex: 1, alignItems: "center", justifyContent: "center", gap: 2 },
  iconWrap: { width: 25, height: 22, alignItems: "center", justifyContent: "center" },
  alertIconWrap: { width: 20, height: 20, borderWidth: 1.5, borderRadius: 10 },
  icon: { fontSize: 19, lineHeight: 20, fontWeight: "800" },
  label: { fontSize: 10, fontWeight: "800" },
  badge: { position: "absolute", top: -2, right: "28%", minWidth: 19, height: 19, paddingHorizontal: 4, borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  badgeText: { color: "#FFFFFF", fontSize: 10, lineHeight: 11, fontWeight: "900" },
});
