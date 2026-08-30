import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { CircleConnection, CircleRequest, getWorkCircle, openDirectChat, respondToWorkCircle } from "../api/work-circle";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function WorkCircleScreen() {
  const { token } = useAuth();
  const { colors } = useTheme();
  const [requests, setRequests] = useState<CircleRequest[]>([]);
  const [connections, setConnections] = useState<CircleConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try { const result = await getWorkCircle(token); setRequests(result.requests); setConnections(result.connections); }
    catch { Alert.alert("Work Circle", "We could not load your connections."); }
    finally { setLoading(false); }
  }, [token]);
  useEffect(() => { load(); }, [load]);
  async function respond(id: string, accept: boolean) { if (!token) return; try { setBusyId(id); await respondToWorkCircle(token, id, accept); await load(); } catch { Alert.alert("Work Circle", "We could not update this request."); } finally { setBusyId(null); } }
  async function message(connection: CircleConnection) { if (!token) return; try { setBusyId(connection.id); const chat = await openDirectChat(token, connection.id); router.push({ pathname: "/chat/[chatId]", params: { chatId: chat.id, direct: "1" } }); } catch { Alert.alert("Direct message", "We could not open this conversation."); } finally { setBusyId(null); } }
  const memberLine = (member: CircleConnection["member"]) => [member.age !== null ? `Age ${member.age}` : null, member.gender].filter(Boolean).join(" · ");
  if (loading) return <SafeAreaView style={[styles.safe, { backgroundColor: colors.canvas }]}><ActivityIndicator color={colors.teal} style={styles.loader} /></SafeAreaView>;
  return <SafeAreaView style={[styles.safe, { backgroundColor: colors.canvas }]}><ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.teal} />}>
    <TouchableOpacity onPress={() => router.back()}><Text style={[styles.back, { color: colors.teal }]}>← Back</Text></TouchableOpacity>
    <Text style={[styles.title, { color: colors.navy }]}>My Work Circle</Text><Text style={[styles.subtitle, { color: colors.muted }]}>People you have mutually added can message you directly.</Text>
    <Text style={[styles.section, { color: colors.text }]}>Requests</Text>
    {requests.length === 0 ? <Text style={[styles.empty, { color: colors.muted }]}>No connection requests right now.</Text> : requests.map((request) => <View key={request.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.name, { color: colors.text }]}>{request.member.anonymousUsername}</Text>{!!memberLine(request.member) && <Text style={[styles.meta, { color: colors.muted }]}>{memberLine(request.member)}</Text>}{!!request.member.bio && <Text style={[styles.bio, { color: colors.muted }]}>{request.member.bio}</Text>}<View style={styles.actions}><TouchableOpacity disabled={busyId === request.id} onPress={() => respond(request.id, false)} style={[styles.decline, { borderColor: colors.border }]}><Text style={[styles.declineText, { color: colors.muted }]}>Decline</Text></TouchableOpacity><TouchableOpacity disabled={busyId === request.id} onPress={() => respond(request.id, true)} style={[styles.accept, { backgroundColor: colors.teal }]}><Text style={styles.acceptText}>{busyId === request.id ? "Saving…" : "Accept"}</Text></TouchableOpacity></View></View>)}
    <Text style={[styles.section, { color: colors.text }]}>My Circle</Text>
    {connections.length === 0 ? <Text style={[styles.empty, { color: colors.muted }]}>Visit a member profile and choose “Add to Work Circle” to start building your network.</Text> : connections.map((connection) => <View key={connection.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}><TouchableOpacity onPress={() => router.push(`/profile/${connection.member.id}` as any)}><Text style={[styles.name, { color: colors.text }]}>{connection.member.anonymousUsername}</Text>{!!memberLine(connection.member) && <Text style={[styles.meta, { color: colors.muted }]}>{memberLine(connection.member)}</Text>}{!!connection.member.bio && <Text style={[styles.bio, { color: colors.muted }]}>{connection.member.bio}</Text>}</TouchableOpacity><TouchableOpacity disabled={busyId === connection.id} onPress={() => message(connection)} style={[styles.message, { backgroundColor: colors.navy }]}><Text style={styles.messageText}>{busyId === connection.id ? "Opening…" : "Message"}</Text></TouchableOpacity></View>)}
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1 }, loader: { marginTop: 100 }, content: { padding: 22, paddingBottom: 44 }, back: { fontWeight: "800" }, title: { fontSize: 27, fontWeight: "900", marginTop: 24 }, subtitle: { fontSize: 14, lineHeight: 21, marginTop: 7 }, section: { fontSize: 17, fontWeight: "900", marginTop: 28, marginBottom: 10 }, empty: { fontSize: 14, lineHeight: 21 }, card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 10 }, name: { fontSize: 16, fontWeight: "900" }, meta: { fontSize: 12, marginTop: 4 }, bio: { fontSize: 13, lineHeight: 19, marginTop: 9 }, actions: { flexDirection: "row", gap: 9, marginTop: 15 }, decline: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 11, alignItems: "center" }, declineText: { fontWeight: "800" }, accept: { flex: 1, borderRadius: 10, padding: 11, alignItems: "center" }, acceptText: { color: "#FFF", fontWeight: "900" }, message: { marginTop: 15, borderRadius: 10, padding: 12, alignItems: "center" }, messageText: { color: "#FFF", fontWeight: "900" } });
