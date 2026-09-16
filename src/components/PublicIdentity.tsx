import { Image, StyleSheet, Text, View } from "react-native";

export type PublicIdentity = {
  anonymousUsername: string;
  publicAvatarUrl?: string | null;
  publicFlair?: string | null;
};

export function compactAvatarUrl(url?: string | null) {
  if (!url) return null;
  return url.replace("/image/upload/", "/image/upload/c_fill,g_face,w_96,h_96,q_auto,f_auto/");
}

export function PublicAvatar({ member, size = 32, backgroundColor = "#EDE2D8", color = "#865D46" }: { member: PublicIdentity; size?: number; backgroundColor?: string; color?: string }) {
  const label = member.publicFlair?.trim() || member.anonymousUsername;
  const imageUrl = compactAvatarUrl(member.publicAvatarUrl);
  return imageUrl
    ? <Image source={{ uri: imageUrl }} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor }} />
    : <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2, backgroundColor }]}><Text style={[styles.initial, { color, fontSize: Math.max(10, Math.round(size * .42))}]}>{label.slice(0, 1).toUpperCase()}</Text></View>;
}

export function PublicFlair({ member, nameColor, flairColor, compact = false }: { member: PublicIdentity; nameColor: string; flairColor: string; compact?: boolean }) {
  return <View style={styles.copy}><Text numberOfLines={1} style={[styles.name, { color: nameColor }]}>{member.publicFlair?.trim() || member.anonymousUsername}</Text>{!!member.publicFlair?.trim() && !compact && <Text numberOfLines={1} style={[styles.handle, { color: flairColor }]}>@{member.anonymousUsername}</Text>}</View>;
}

const styles = StyleSheet.create({
  fallback: { alignItems: "center", justifyContent: "center" },
  initial: { fontWeight: "900" },
  copy: { flexShrink: 1 },
  name: { fontWeight: "900" },
  handle: { fontSize: 10, marginTop: 1, fontWeight: "700" },
});
