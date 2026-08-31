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

  const snippet = invite?.message ? `${invite.message.slice(0, 72)}${invite.message.length > 72 ? "…" : ""}` : "";
  return <Modal transparent visible={!!invite} animationType="fade" onRequestClose={() => respond(false)}>
    <View style={styles.backdrop}><View style={styles.card}>
      <View style={styles.desk}><Text style={styles.laptop}>▰</Text><Text style={styles.frame}>▣</Text><Text style={styles.pen}>╱</Text><View style={styles.paperStack} /><Text style={styles.landingPlane}>✈</Text></View>
      <Text style={styles.eyebrow}>A PAPER PLANE LANDED ON YOUR DESK</Text>
      <Text style={styles.title}>{invite?.sender.anonymousUsername}</Text>
      <Text style={styles.preview}>“{snippet}”</Text>
      <Text style={styles.hint}>Open it to accept the connection and move the conversation to your Inbox.</Text>
      {responding ? <ActivityIndicator color={Brand.colors.teal} style={styles.loader} /> : <View style={styles.actions}>
        <TouchableOpacity style={styles.decline} onPress={() => respond(false)}><Text style={styles.declineText}>Let it pass</Text></TouchableOpacity>
        <TouchableOpacity style={styles.accept} onPress={() => respond(true)}><Text style={styles.acceptText}>Open & chat</Text></TouchableOpacity>
      </View>}
    </View></View>
  </Modal>;
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "rgba(55, 34, 22, 0.62)" }, card: { backgroundColor: "#FFF8ED", borderRadius: 24, padding: 22, alignItems: "center" }, desk: { height: 140, width: "100%", borderRadius: 16, backgroundColor: "#9A6240", overflow: "hidden", position: "relative" }, laptop: { position: "absolute", left: 21, top: 28, fontSize: 56, color: "#47342C" }, frame: { position: "absolute", right: 22, top: 20, color: "#F3D7AB", fontSize: 43 }, pen: { position: "absolute", right: 84, bottom: 23, color: "#F8D37E", fontSize: 36 }, paperStack: { position: "absolute", left: 110, bottom: 19, height: 42, width: 68, backgroundColor: "#F6E8D0", borderRadius: 4, transform: [{ rotate: "-5deg" }] }, landingPlane: { position: "absolute", left: 126, bottom: 46, color: "#FFF9EE", fontSize: 39, transform: [{ rotate: "-20deg" }] }, eyebrow: { color: "#9A5A32", fontSize: 10, letterSpacing: 1.1, fontWeight: "900", marginTop: 18, textAlign: "center" }, title: { color: "#3E281E", fontSize: 22, lineHeight: 28, fontWeight: "900", textAlign: "center", marginTop: 7 }, preview: { color: "#543A2D", backgroundColor: "#F4E5D2", borderRadius: 14, padding: 14, width: "100%", textAlign: "center", fontSize: 14, lineHeight: 20, marginTop: 14 }, hint: { color: "#806657", textAlign: "center", fontSize: 12, lineHeight: 18, marginTop: 10 },
  actions: { flexDirection: "row", width: "100%", gap: 10, marginTop: 20 }, decline: { flex: 1, borderWidth: 1, borderColor: Brand.colors.border, borderRadius: 12, minHeight: 48, alignItems: "center", justifyContent: "center" }, declineText: { color: Brand.colors.navyMuted, fontWeight: "800" }, accept: { flex: 1, backgroundColor: Brand.colors.navy, borderRadius: 12, minHeight: 48, alignItems: "center", justifyContent: "center" }, acceptText: { color: "#FFF", fontWeight: "800" }, loader: { marginTop: 24 },
});
