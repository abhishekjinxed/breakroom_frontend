import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Easing, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

import { getPendingPaperPlanes, PaperPlaneInvite, respondToPaperPlane } from "../api/bored";
import { Brand } from "../constants/brand";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { getSocket } from "../services/socket";

const positions = [
  { left: 18, top: 12, rotate: "-16deg" }, { left: 122, top: 4, rotate: "9deg" },
  { left: 220, top: 22, rotate: "-7deg" }, { left: 56, top: 76, rotate: "12deg" },
  { left: 166, top: 74, rotate: "-12deg" }, { left: 260, top: 82, rotate: "15deg" },
];

/** An embedded desk tray: arrivals stay visible until the recipient picks one. */
export function DeskPlanes() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [invites, setInvites] = useState<PaperPlaneInvite[]>([]);
  const [selected, setSelected] = useState<PaperPlaneInvite | null>(null);
  const [responding, setResponding] = useState(false);
  const [responseError, setResponseError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const load = () => getPendingPaperPlanes(token).then((result) => setInvites(result.invites)).catch(() => undefined);
    load();
    const socket = getSocket();
    const receive = (incoming: PaperPlaneInvite) => setInvites((current) => [incoming, ...current.filter((item) => item.id !== incoming.id)]);
      socket?.on("paper_plane:received", receive);
    const poll = setInterval(load, 15000);
    return () => { socket?.off("paper_plane:received", receive); clearInterval(poll); };
  }, [token]);

  async function respond(accept: boolean) {
    if (!token || !selected || responding) return;
    const invite = selected;
    try {
      setResponding(true); setResponseError(null);
      const result = await respondToPaperPlane(token, invite.id, accept);
      if (accept && (!result.accepted || !result.chatId)) throw new Error(`${t("paperPlane")} ${t("tryAgain")}`);
      setInvites((current) => current.filter((item) => item.id !== invite.id));
      setSelected(null);
      // An accepted plane creates a persistent private conversation. Take the
      // recipient to Inbox so the new thread is visible alongside the rest
      // of their conversations instead of opening a one-off chat screen.
      if (result.accepted && result.chatId) router.replace("/inbox" as any);
    } catch (error: any) {
      // Keep the plane on the desk when Accept fails. Previously it was
      // removed and a browser-only alert was easy to miss, making a failed
      // request look like a successful acceptance.
      const message = error?.response?.data?.message || error?.message || `${t("paperPlane")} ${t("tryAgain")}`;
      const code = error?.response?.data?.errorCode;
      setResponseError(code ? `${message} (${code})` : message);
    } finally { setResponding(false); }
  }

  const snippet = selected?.message ? `${selected.message.slice(0, 120)}${selected.message.length > 120 ? "…" : ""}` : "";
  return <>
    <View style={styles.tray} pointerEvents="box-none">
      {invites.slice(0, positions.length).map((invite, index) => {
        const position = positions[index];
        return <FlyingPlane key={invite.id} invite={invite} position={position} onOpen={() => setSelected(invite)} />;
      })}
      {invites.length > 0 && <View style={styles.count}><Text style={styles.countText}>{invites.length} {invites.length === 1 ? "plane landed" : "planes landed"}</Text></View>}
    </View>
    <Modal transparent visible={!!selected} animationType="fade" onRequestClose={() => setSelected(null)}>
      <View style={styles.backdrop}><View style={styles.letter}>
        <Text style={[styles.letterPlane, selected?.isCharter && styles.charterPlaneMark]}>✈</Text><Text style={[styles.eyebrow, selected?.isCharter && styles.charterEyebrow]}>{selected?.isCharter ? "CHARTER PLANE" : t("paperPlane")}</Text>
        <Text style={styles.sender}>{t("from")} {selected?.sender.anonymousUsername}</Text>
        <Text style={styles.note}>“{snippet}”</Text>
        <Text style={styles.hint}>{selected?.isCharter ? "This red plane was sent directly to your desk." : t("planeHint")}</Text>
        {responseError && <Text style={styles.error}>{responseError}</Text>}
        {responding ? <ActivityIndicator color={Brand.colors.teal} style={styles.loader} /> : <View style={styles.actions}>
          <TouchableOpacity style={styles.decline} onPress={() => respond(false)}><Text style={styles.declineText}>{t("letItPass")}</Text></TouchableOpacity>
          <TouchableOpacity style={styles.accept} onPress={() => respond(true)}><Text style={styles.acceptText}>{t("acceptPlane")}</Text></TouchableOpacity>
        </View>}
        {!responding && <TouchableOpacity onPress={() => { setResponseError(null); setSelected(null); }} style={styles.close}><Text style={styles.closeText}>{t("backToDesk")}</Text></TouchableOpacity>}
      </View></View>
    </Modal>
  </>;
}

function FlyingPlane({ invite, position, onOpen }: { invite: PaperPlaneInvite; position: typeof positions[number]; onOpen: () => void }) {
  const landing = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(landing, { toValue: 1, duration: 720, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [landing]);
  const translateX = landing.interpolate({ inputRange: [0, 1], outputRange: [95, 0] });
  const translateY = landing.interpolate({ inputRange: [0, 1], outputRange: [-65, 0] });
  const scale = landing.interpolate({ inputRange: [0, .8, 1], outputRange: [.65, 1.04, 1] });
  const opacity = landing.interpolate({ inputRange: [0, .15, 1], outputRange: [0, 1, 1] });
  return <Animated.View style={[styles.plane, invite.isCharter && styles.charterPlane, { left: position.left, top: position.top, opacity, transform: [{ translateX }, { translateY }, { scale }, { rotate: position.rotate }] }]}><TouchableOpacity accessibilityRole="button" accessibilityLabel="Open a landed paper plane" activeOpacity={0.78} onPress={onOpen} style={styles.planeButton}><Text style={[styles.planeMark, invite.isCharter && styles.charterPlaneMark]}>✈</Text><Text style={[styles.seal, invite.isCharter && styles.charterSeal]}>{invite.isCharter ? "C" : invite.sender.anonymousUsername.charAt(0).toUpperCase()}</Text></TouchableOpacity></Animated.View>;
}

const styles = StyleSheet.create({
  tray: { position: "absolute", left: 0, right: 0, top: 36, height: 152, zIndex: 3 },
  plane: { position: "absolute", width: 64, height: 46, borderRadius: 6, backgroundColor: "#FFF2D9", borderWidth: 1, borderColor: "#D4A979", shadowColor: "#3C2418", shadowOpacity: 0.25, shadowRadius: 4, elevation: 4 }, planeButton: { flex: 1, justifyContent: "center", alignItems: "center" },
  planeMark: { fontSize: 31, color: "#9A5A32", lineHeight: 34 }, seal: { position: "absolute", right: 5, bottom: 3, height: 14, minWidth: 14, borderRadius: 7, backgroundColor: "#6E3B2A", color: "#FFF8ED", fontSize: 8, fontWeight: "900", textAlign: "center", lineHeight: 14, overflow: "hidden" },
  charterPlane: { backgroundColor: "#FFE0D9", borderColor: "#B8443F" }, charterPlaneMark: { color: "#B8443F" }, charterSeal: { backgroundColor: "#B8443F" }, charterEyebrow: { color: "#B8443F" },
  count: { position: "absolute", left: 18, bottom: 0, backgroundColor: "rgba(62, 40, 30, .82)", borderRadius: 10, paddingHorizontal: 9, paddingVertical: 5 }, countText: { color: "#FFF7E8", fontSize: 10, fontWeight: "900" },
  backdrop: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "rgba(55, 34, 22, .62)" }, letter: { backgroundColor: "#FFF8ED", borderRadius: 24, padding: 23, alignItems: "center" }, letterPlane: { color: "#9A5A32", fontSize: 42, transform: [{ rotate: "-12deg" }] }, eyebrow: { color: "#9A5A32", fontSize: 10, letterSpacing: 1.2, fontWeight: "900", marginTop: 5 }, sender: { color: "#3E281E", fontSize: 22, fontWeight: "900", textAlign: "center", marginTop: 8 }, note: { color: "#543A2D", backgroundColor: "#F4E5D2", borderRadius: 14, padding: 14, width: "100%", textAlign: "center", fontSize: 14, lineHeight: 20, marginTop: 15 }, hint: { color: "#806657", textAlign: "center", fontSize: 12, lineHeight: 18, marginTop: 10 }, error: { color: "#B54D43", textAlign: "center", fontSize: 12, lineHeight: 17, marginTop: 10, fontWeight: "700" }, actions: { flexDirection: "row", width: "100%", gap: 10, marginTop: 20 }, decline: { flex: 1, borderWidth: 1, borderColor: Brand.colors.border, borderRadius: 12, minHeight: 48, alignItems: "center", justifyContent: "center" }, declineText: { color: Brand.colors.navyMuted, fontWeight: "800" }, accept: { flex: 1, backgroundColor: Brand.colors.navy, borderRadius: 12, minHeight: 48, alignItems: "center", justifyContent: "center" }, acceptText: { color: "#FFF", fontWeight: "800" }, loader: { marginTop: 24 }, close: { marginTop: 15, padding: 6 }, closeText: { color: "#806657", fontWeight: "800", fontSize: 12 },
});
