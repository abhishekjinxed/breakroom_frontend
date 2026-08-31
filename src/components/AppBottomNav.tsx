import { router, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { getSocket } from "../services/socket";

const items = [
  { label: "home", icon: "⌂", route: "/" },
  { label: "Inbox", icon: "✉", route: "/inbox" },
] as const;

export function AppBottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [planeAlert, setPlaneAlert] = useState(false);
  const [chatAlert, setChatAlert] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    const onPlane = () => setPlaneAlert(true);
    const onChatRemoved = () => setChatAlert(true);
    const onInboxUpdated = () => setChatAlert(true);
    socket?.on("paper_plane:received", onPlane);
    socket?.on("chat:partner-left", onChatRemoved);
    socket?.on("inbox:updated", onInboxUpdated);
    return () => { socket?.off("paper_plane:received", onPlane); socket?.off("chat:partner-left", onChatRemoved); socket?.off("inbox:updated", onInboxUpdated); };
  }, []);

  return <View style={[styles.shell, { backgroundColor: colors.surface, borderColor: colors.border }]}>
    {items.map((item) => {
      const active = item.route === "/" ? pathname === "/" : pathname.startsWith(item.route);
      const label = item.route === "/inbox" ? item.label : t(item.label as any);
      const hasAlert = item.route === "/" ? planeAlert : chatAlert;
      return <TouchableOpacity key={item.route} accessibilityRole="button" accessibilityLabel={label} style={styles.item} onPress={() => { if (item.route === "/") setPlaneAlert(false); else setChatAlert(false); router.replace(item.route as any); }}>
        <Text style={[styles.icon, { color: active ? colors.teal : colors.muted }]}>{item.icon}</Text>
        {hasAlert && <View style={[styles.alertDot, { backgroundColor: colors.teal }]} />}
        <Text style={[styles.label, { color: active ? colors.teal : colors.muted }]}>{label}</Text>
      </TouchableOpacity>;
    })}
  </View>;
}

const styles = StyleSheet.create({
  shell: { minHeight: 66, flexDirection: "row", borderTopWidth: 1, paddingHorizontal: 8, paddingTop: 8, paddingBottom: 6 },
  item: { flex: 1, alignItems: "center", justifyContent: "center", gap: 2 },
  icon: { fontSize: 19, lineHeight: 20, fontWeight: "700" },
  label: { fontSize: 10, fontWeight: "800" }, alertDot: { position: "absolute", top: 0, right: "31%", width: 8, height: 8, borderRadius: 4 },
});
