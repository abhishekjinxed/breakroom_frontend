import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

import { getPendingPaperPlane, PaperPlaneInvite, respondToPaperPlane } from "../api/bored";
import { Brand } from "../constants/brand";
import { useAuth } from "../context/AuthContext";
import { getSocket } from "../services/socket";

export function PaperPlaneInbox() {
  const { token } = useAuth();
  const [invite, setInvite] = useState<PaperPlaneInvite | null>(null);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    if (!token) return;
    const loadPending = () => getPendingPaperPlane(token).then((result) => setInvite(result.invite)).catch(() => undefined);
    loadPending();
    const socket = getSocket();
    const receive = (incoming: PaperPlaneInvite) => setInvite(incoming);
    socket?.on("paper_plane:received", receive);
    const poll = setInterval(loadPending, 15000);
    return () => { socket?.off("paper_plane:received", receive); clearInterval(poll); };
  }, [token]);

  async function respond(accept: boolean) {
    if (!token || !invite || responding) return;
    try {
      setResponding(true);
      const result = await respondToPaperPlane(token, invite.id, accept);
      setInvite(null);
      if (result.accepted && result.chatId) router.replace({ pathname: "/chat/[chatId]", params: { chatId: result.chatId, direct: "1" } });
    } catch (error: any) {
      setInvite(null);
      Alert.alert("Plane no longer available", error?.response?.data?.message || "This invitation has expired or was withdrawn.");
    } finally {
      setResponding(false);
    }
  }

  return <Modal transparent visible={!!invite} animationType="fade" onRequestClose={() => respond(false)}>
    <View style={styles.backdrop}><View style={styles.card}>
      <View style={styles.plane}><Text style={styles.planeIcon}>✈</Text></View>
      <Text style={styles.eyebrow}>PAPER PLANE LANDED</Text>
      <Text style={styles.title}>{invite?.sender.anonymousUsername} sent you a break note</Text>
      <Text style={styles.message}>“{invite?.message}”</Text>
      {responding ? <ActivityIndicator color={Brand.colors.teal} style={styles.loader} /> : <View style={styles.actions}>
        <TouchableOpacity style={styles.decline} onPress={() => respond(false)}><Text style={styles.declineText}>Let it pass</Text></TouchableOpacity>
        <TouchableOpacity style={styles.accept} onPress={() => respond(true)}><Text style={styles.acceptText}>Open & chat</Text></TouchableOpacity>
      </View>}
    </View></View>
  </Modal>;
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "rgba(12, 29, 46, 0.55)" },
  card: { backgroundColor: Brand.colors.surface, borderRadius: 24, padding: 24, alignItems: "center" },
  plane: { width: 62, height: 62, borderRadius: 20, backgroundColor: Brand.colors.tealSoft, alignItems: "center", justifyContent: "center" }, planeIcon: { color: Brand.colors.teal, fontSize: 30 },
  eyebrow: { color: Brand.colors.teal, fontSize: 10, letterSpacing: 1.2, fontWeight: "900", marginTop: 18 }, title: { color: Brand.colors.navy, fontSize: 21, lineHeight: 27, fontWeight: "800", textAlign: "center", marginTop: 8 },
  message: { color: Brand.colors.text, backgroundColor: "#F7F9FB", borderRadius: 14, padding: 14, width: "100%", textAlign: "center", fontSize: 15, lineHeight: 21, marginTop: 18 },
  actions: { flexDirection: "row", width: "100%", gap: 10, marginTop: 20 }, decline: { flex: 1, borderWidth: 1, borderColor: Brand.colors.border, borderRadius: 12, minHeight: 48, alignItems: "center", justifyContent: "center" }, declineText: { color: Brand.colors.navyMuted, fontWeight: "800" }, accept: { flex: 1, backgroundColor: Brand.colors.navy, borderRadius: 12, minHeight: 48, alignItems: "center", justifyContent: "center" }, acceptText: { color: "#FFF", fontWeight: "800" }, loader: { marginTop: 24 },
});
