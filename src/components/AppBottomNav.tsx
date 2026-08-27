import { router, usePathname } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

const items = [
  { label: "home", icon: "⌂", route: "/" },
  { label: "pulse", icon: "◉", route: "/office-pulse" },
  { label: "briefs", icon: "▶", route: "/break-briefs" },
  { label: "connect", icon: "◌", route: "/bored" },
] as const;

export function AppBottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { colors } = useTheme();

  return <View style={[styles.shell, { backgroundColor: colors.surface, borderColor: colors.border }]}>
    {items.map((item) => {
      const active = item.route === "/" ? pathname === "/" : pathname.startsWith(item.route);
      const label = t(item.label);
      return <TouchableOpacity key={item.route} accessibilityRole="button" accessibilityLabel={label} style={styles.item} onPress={() => router.replace(item.route)}>
        <Text style={[styles.icon, { color: active ? colors.teal : colors.muted }]}>{item.icon}</Text>
        <Text style={[styles.label, { color: active ? colors.teal : colors.muted }]}>{label}</Text>
      </TouchableOpacity>;
    })}
  </View>;
}

const styles = StyleSheet.create({
  shell: { minHeight: 66, flexDirection: "row", borderTopWidth: 1, paddingHorizontal: 8, paddingTop: 8, paddingBottom: 6 },
  item: { flex: 1, alignItems: "center", justifyContent: "center", gap: 2 },
  icon: { fontSize: 19, lineHeight: 20, fontWeight: "700" },
  label: { fontSize: 10, fontWeight: "800" },
});
