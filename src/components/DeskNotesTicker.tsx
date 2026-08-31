import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { getStickyNotes, DeskStickyNote } from "../api/stickies";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export function DeskNotesTicker() {
  const { token } = useAuth();
  const { colors } = useTheme();
  const [notes, setNotes] = useState<DeskStickyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    if (!token) return;
    try { setNotes(await getStickyNotes(token)); } finally { setLoading(false); }
  }, [token]);
  useEffect(() => { load(); const timer = setInterval(load, 30000); return () => clearInterval(timer); }, [load]);

  return <TouchableOpacity activeOpacity={0.9} onPress={() => router.push("/desk-notes" as any)} style={[styles.shell, { backgroundColor: colors.surface, borderColor: colors.border }]}>
    <View style={styles.header}><View><Text style={[styles.eyebrow, { color: colors.teal }]}>DESK NOTES</Text><Text style={[styles.title, { color: colors.text }]}>What’s on everyone’s desk</Text></View><Text style={[styles.open, { color: colors.teal }]}>Open →</Text></View>
    {loading ? <ActivityIndicator color={colors.teal} style={styles.loader} /> : notes.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ticker}>{notes.slice(0, 8).map((note) => <View key={note.id} style={[styles.note, { backgroundColor: colors.amberSoft }]}><Text numberOfLines={3} style={[styles.noteText, { color: colors.text }]}>{note.text}</Text><Text numberOfLines={1} style={[styles.author, { color: colors.violet }]}>{note.author.anonymousUsername} · {note._count.applauds} applause</Text></View>)}</ScrollView> : <View style={[styles.empty, { backgroundColor: colors.surfaceSoft }]}><Text style={[styles.emptyText, { color: colors.muted }]}>No notes yet. Pin the first thoughtful thought.</Text></View>}
  </TouchableOpacity>;
}

const styles = StyleSheet.create({
  shell: { borderWidth: 1, borderRadius: 19, padding: 17, marginTop: 14 }, header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 }, eyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 1.1 }, title: { fontSize: 15, fontWeight: "900", marginTop: 4 }, open: { fontWeight: "900", fontSize: 12 }, loader: { height: 92, justifyContent: "center" }, ticker: { gap: 10, paddingTop: 14, paddingRight: 4 }, note: { width: 164, minHeight: 92, borderRadius: 10, padding: 11, justifyContent: "space-between", transform: [{ rotate: "-1deg" }] }, noteText: { fontSize: 12, lineHeight: 17, fontWeight: "700" }, author: { fontSize: 9, fontWeight: "900", marginTop: 8 }, empty: { marginTop: 14, borderRadius: 10, padding: 13 }, emptyText: { fontSize: 12, lineHeight: 18 },
});
