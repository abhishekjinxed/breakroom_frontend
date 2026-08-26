import { router, usePathname } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Brand } from "../constants/brand";

const items = [
  { label: "Home", icon: "⌂", route: "/" },
  { label: "Pulse", icon: "◉", route: "/office-pulse" },
  { label: "Briefs", icon: "▶", route: "/break-briefs" },
  { label: "Connect", icon: "◌", route: "/bored" },
] as const;

export function AppBottomNav() {
  const pathname = usePathname();

  return <View style={styles.shell}>
    {items.map((item) => {
      const active = item.route === "/" ? pathname === "/" : pathname.startsWith(item.route);
      return <TouchableOpacity key={item.route} accessibilityRole="button" accessibilityLabel={item.label} style={styles.item} onPress={() => router.replace(item.route)}>
        <Text style={[styles.icon, active && styles.active]}>{item.icon}</Text>
        <Text style={[styles.label, active && styles.active]}>{item.label}</Text>
      </TouchableOpacity>;
    })}
  </View>;
}

const styles = StyleSheet.create({
  shell: { minHeight: 66, flexDirection: "row", backgroundColor: Brand.colors.surface, borderTopWidth: 1, borderColor: Brand.colors.border, paddingHorizontal: 8, paddingTop: 8, paddingBottom: 6 },
  item: { flex: 1, alignItems: "center", justifyContent: "center", gap: 2 },
  icon: { color: Brand.colors.muted, fontSize: 19, lineHeight: 20, fontWeight: "700" },
  label: { color: Brand.colors.muted, fontSize: 10, fontWeight: "800" },
  active: { color: Brand.colors.teal },
});
