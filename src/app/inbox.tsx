import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Modal, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { deleteDirectConversation, getInbox, InboxConversation } from "../api/inbox";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { blockUser, reportContent } from "../api/safety";

export default function InboxScreen() {
  const { token } = useAuth();
  const { colors } = useTheme();
  const [items, setItems] = useState<InboxConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<InboxConversation | null>(null);
  const [working, setWorking] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const load = useCallback(async () => { if (!token) return; try { setItems(await getInbox(token)); } finally { setLoading(false); } }, [token]);
  useEffect(() => { load(); }, [load]);
  const time = (value: string) => new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit", month: "short", day: "numeric" }).format(new Date(value));

  async function manage(action: "delete" | "block" | "report") {
    if (!token || !selected || working) return;
    const item = selected;
    try {
      setWorking(true); setNotice(null);
      if (action === "delete") {
        const result = await deleteDirectConversation(token, item.id);
        if (!result.removed) throw new Error("This conversation is no longer available.");
        setItems((current) => current.filter((entry) => entry.id !== item.id)); setSelected(null);
      } else if (action === "block") {
        await blockUser(token, item.member.id);
        setItems((current) => current.filter((entry) => entry.id !== item.id)); setSelected(null);
      } else {
        await reportContent(token, "USER", item.member.id, "Inappropriate behaviour in a private conversation");
        setNotice("Report received. Our moderation team will review it.");
      }
    } catch (error: any) { setNotice(error?.response?.data?.message || error?.message || "Could not complete that action. Please try again."); }
    finally { setWorking(false); }
  }

  return <SafeAreaView style={[styles.safe, { backgroundColor: colors.canvas }]}><ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.teal} />}><Text style={[styles.eyebrow, { color: colors.teal }]}>WORK CIRCLE</Text><Text style={[styles.title, { color: colors.navy }]}>Inbox</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Private conversations from accepted Paper Planes.</Text>{loading ? <ActivityIndicator color={colors.teal} style={styles.loader} /> : items.length === 0 ? <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.emptyTitle, { color: colors.text }]}>No conversations yet</Text><Text style={[styles.emptyText, { color: colors.muted }]}>Accept a Paper Plane from your desk to begin a private chat.</Text></View> : items.map((item) => <TouchableOpacity key={item.id} onPress={() => router.push({ pathname: "/chat/[chatId]", params: { chatId: item.id, direct: "1" } })} onLongPress={() => { setNotice(null); setSelected(item); }} style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.avatar, { backgroundColor: colors.violetSoft }]}><Text style={[styles.initial, { color: colors.violet }]}>{item.member.anonymousUsername[0].toUpperCase()}</Text></View><View style={styles.copy}><View style={styles.nameRow}><Text style={[styles.name, { color: colors.text }]}>{item.member.anonymousUsername}</Text><Text style={[styles.time, { color: colors.muted }]}>{time(item.updatedAt)}</Text></View><Text numberOfLines={1} style={[styles.preview, { color: colors.muted }]}>{item.latestMessage?.text ?? "You are connected — say hello."}</Text></View>{item.unreadCount > 0 && <View style={[styles.badge, { backgroundColor: colors.teal }]}><Text style={styles.badgeText}>{item.unreadCount > 9 ? "9+" : item.unreadCount}</Text></View>}<TouchableOpacity accessibilityLabel="Manage conversation" onPress={() => { setNotice(null); setSelected(item); }} hitSlop={10} style={styles.manage}><Text style={[styles.manageText, { color: colors.muted }]}>•••</Text></TouchableOpacity></TouchableOpacity>)}</ScrollView><Modal transparent visible={!!selected} animationType="fade" onRequestClose={() => setSelected(null)}><View style={styles.backdrop}><View style={[styles.sheet, { backgroundColor: colors.surface }]}><Text style={[styles.sheetTitle, { color: colors.navy }]}>{selected?.member.anonymousUsername}</Text><Text style={[styles.sheetCopy, { color: colors.muted }]}>Manage this private conversation.</Text>{notice && <Text style={[styles.notice, { color: colors.danger }]}>{notice}</Text>}<TouchableOpacity disabled={working} onPress={() => manage("delete")} style={[styles.action, { borderColor: colors.border }]}><Text style={styles.dangerAction}>{working ? "Working…" : "Delete conversation"}</Text></TouchableOpacity><TouchableOpacity disabled={working} onPress={() => manage("block")} style={[styles.action, { borderColor: colors.border }]}><Text style={styles.dangerAction}>Block user</Text></TouchableOpacity><TouchableOpacity disabled={working} onPress={() => manage("report")} style={[styles.action, { borderColor: colors.border }]}><Text style={[styles.actionText, { color: colors.text }]}>Report user</Text></TouchableOpacity><TouchableOpacity disabled={working} onPress={() => setSelected(null)} style={styles.close}><Text style={[styles.closeText, { color: colors.muted }]}>Cancel</Text></TouchableOpacity></View></View></Modal></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, content: { padding: 22, paddingBottom: 38 }, eyebrow: { fontSize: 11, fontWeight: "900", letterSpacing: 1.3 }, title: { fontSize: 30, fontWeight: "900", marginTop: 7 }, subtitle: { fontSize: 14, lineHeight: 20, marginTop: 7 }, loader: { marginTop: 60 }, empty: { borderWidth: 1, borderRadius: 18, padding: 20, marginTop: 25 }, emptyTitle: { fontWeight: "900", fontSize: 16 }, emptyText: { lineHeight: 20, fontSize: 13, marginTop: 6 }, row: { borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 13, flexDirection: "row", alignItems: "center", gap: 11 }, avatar: { width: 45, height: 45, borderRadius: 14, alignItems: "center", justifyContent: "center" }, initial: { fontSize: 18, fontWeight: "900" }, copy: { flex: 1 }, nameRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 }, name: { fontSize: 15, fontWeight: "900" }, time: { fontSize: 10 }, preview: { fontSize: 13, marginTop: 5 }, badge: { minWidth: 21, height: 21, borderRadius: 11, alignItems: "center", justifyContent: "center", paddingHorizontal: 5 }, badgeText: { color: "#FFF", fontSize: 10, fontWeight: "900" }, manage: { paddingLeft: 4, paddingVertical: 8 }, manageText: { fontWeight: "900", letterSpacing: 1, fontSize: 15 }, backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(42, 28, 21, .48)" }, sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, paddingBottom: 34 }, sheetTitle: { fontSize: 20, fontWeight: "900" }, sheetCopy: { fontSize: 13, marginTop: 5 }, notice: { fontSize: 12, lineHeight: 18, marginTop: 12 }, action: { minHeight: 50, borderWidth: 1, borderRadius: 12, justifyContent: "center", paddingHorizontal: 15, marginTop: 12 }, actionText: { fontWeight: "800" }, dangerAction: { color: "#C0392B", fontWeight: "900" }, close: { alignItems: "center", padding: 15, marginTop: 5 }, closeText: { fontWeight: "800" },
});
