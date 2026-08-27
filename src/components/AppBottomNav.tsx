import { router, usePathname } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Brand } from "../constants/brand";
import { useLanguage } from "../context/LanguageContext";

const items = [
  { label: "home", icon: "⌂", route: "/" },
  { label: "pulse", icon: "◉", route: "/office-pulse" },
  { label: "briefs", icon: "▶", route: "/break-briefs" },
  { label: "connect", icon: "◌", route: "/bored" },
] as const;

export function AppBottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return <View style={styles.shell}>
    {items.map((item) => {
      const active = item.route === "/" ? pathname === "/" : pathname.startsWith(item.route);
      const label = t(item.label);
      return <TouchableOpacity key={item.route} accessibilityRole="button" accessibilityLabel={label} style={styles.item} onPress={() => router.replace(item.route)}>
        <Text style={[styles.icon, active && styles.active]}>{item.icon}</Text>
        <Text style={[styles.label, active && styles.active]}>{label}</Text>
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
