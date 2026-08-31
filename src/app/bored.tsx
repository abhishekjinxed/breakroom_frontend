import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, Easing, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

import { joinBored, sendPaperPlane, stopLooking } from "../api/bored";
import { Brand } from "../constants/brand";
import { useAuth } from "../context/AuthContext";
import { getSocket } from "../services/socket";
import { useTheme } from "../context/ThemeContext";

type ScreenState = "READY" | "SEARCHING" | "SENT" | "MATCHED";

export default function BoredScreen() {
  const { user, token } = useAuth();
  const { colors } = useTheme();
  const [state, setState] = useState<ScreenState>("READY");
  const [loading, setLoading] = useState(false);
  const [planeMessage, setPlaneMessage] = useState("");
  const matchedRef = useRef(false);
  const flightProgress = useRef(new Animated.Value(0)).current;

  function openMatchedChat(chatId: string) {
    if (matchedRef.current || !chatId) return;
    matchedRef.current = true;
    setState("MATCHED");
    setLoading(false);
    router.replace(`/chat/${chatId}`);
  }

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handleMatch = (data: { chatId: string }) => {
      openMatchedChat(data.chatId);
    };
    socket.on("match_found", handleMatch);
    return () => {
      socket.off("match_found", handleMatch);
    };
  }, []);

  useEffect(() => {
    if (!token || state !== "SEARCHING") return;

    // Socket delivery is the fast path. This retry makes matching reliable
    // when one client connects late or misses that event.
    const retryMatch = async () => {
      try {
        const result = await joinBored(token);
        if (result.matched && result.chat?.id) openMatchedChat(result.chat.id);
      } catch {
        // Keep the user in the queue; the next retry or socket event can
        // still complete the match.
      }
    };

    const interval = setInterval(retryMatch, 3000);
    return () => clearInterval(interval);
  }, [state, token]);

  useEffect(() => {
    if (state !== "SENT") {
      flightProgress.stopAnimation();
      flightProgress.setValue(0);
      return;
    }

    const flight = Animated.loop(Animated.sequence([
      Animated.timing(flightProgress, { toValue: 1, duration: 1750, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(flightProgress, { toValue: 0, duration: 1, useNativeDriver: true }),
    ]));
    flight.start();
    return () => flight.stop();
  }, [flightProgress, state]);

  async function handleFindSomeone() {
    if (!token || loading || state === "SEARCHING") return;
    try {
      matchedRef.current = false;
      setLoading(true);
      setState("SEARCHING");
      const result = await joinBored(token);
      if (result.matched && result.chat?.id) {
        openMatchedChat(result.chat.id);
      }
    } catch (error: any) {
      setState("READY");
      Alert.alert("Unable to start a break", error?.response?.data?.message || "Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStopLooking() {
    if (!token) return;
    try {
      setLoading(true);
      await stopLooking(token);
      matchedRef.current = false;
      setState("READY");
    } catch (error: any) {
      Alert.alert("Unable to stop searching", error?.response?.data?.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendPaperPlane() {
    if (!token || loading) return;
    const message = planeMessage.trim();
    if (!message) {
      Alert.alert("Write a note", "Add a short message before sending your paper plane.");
      return;
    }

    try {
      setLoading(true);
      await sendPaperPlane(token, message);
      setState("SENT");
    } catch (error: any) {
      Alert.alert("Unable to send", error?.response?.data?.message || "Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return <View style={[styles.loadingScreen, { backgroundColor: colors.canvas }]}><ActivityIndicator color={colors.teal} size="large" /></View>;
  }

  const isSearching = state === "SEARCHING";
  const planeIsFlying = state === "SENT";
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.canvas }]}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Text style={[styles.brand, { color: colors.teal }]}>BREAKROOM</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.stepRow}>
            <View style={[styles.stepActive, { backgroundColor: colors.teal }]} /><View style={[styles.stepLine, { backgroundColor: colors.border }]} />
            <View style={[isSearching || planeIsFlying ? styles.stepActive : styles.stepIdle, { backgroundColor: isSearching || planeIsFlying ? colors.teal : colors.border }]} /><View style={[styles.stepLine, { backgroundColor: colors.border }]} />
            <View style={[planeIsFlying ? styles.stepActive : styles.stepIdle, { backgroundColor: planeIsFlying ? colors.teal : colors.border }]} />
          </View>
          <View style={[styles.matchCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {planeIsFlying && <View style={styles.flightLane}>
              <Animated.Text style={[styles.flyingPlane, { color: colors.teal, transform: [{ translateX: flightProgress.interpolate({ inputRange: [0, 1], outputRange: [-100, 230] }) }, { translateY: flightProgress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [7, -8, 5] }) }, { rotate: "-18deg" }] }]}>✈</Animated.Text>
            </View>}
            <View style={[styles.iconTile, { backgroundColor: colors.tealSoft }]}>
              {isSearching ? <ActivityIndicator color={colors.teal} /> : <Text style={[styles.iconText, { color: colors.teal }]}>{planeIsFlying ? "⌁" : "✈"}</Text>}
            </View>
            <Text style={[styles.eyebrow, { color: colors.teal }]}>{isSearching ? "MATCHING IN PROGRESS" : planeIsFlying ? "PAPER PLANE IN FLIGHT" : "WORKDAY BREAK"}</Text>
            <Text style={[styles.title, { color: colors.navy }]}>{isSearching ? "Looking for a break partner" : planeIsFlying ? "Your note is looking for a desk" : "Send a paper plane"}</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              {isSearching ? "We’ll connect you when another professional is ready for a quick conversation." : planeIsFlying ? "When someone opens your note and accepts, your break chat will begin." : "Write a short invitation. We’ll send it to one available colleague in the Breakroom."}
            </Text>
            {isSearching ? (
              <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={handleStopLooking} disabled={loading}>
                <Text style={[styles.secondaryButtonText, { color: colors.danger }]}>Cancel search</Text>
              </TouchableOpacity>
            ) : planeIsFlying ? (
              <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => { setPlaneMessage(""); setState("READY"); }} disabled={loading}>
                <Text style={[styles.secondaryButtonText, { color: colors.danger }]}>Write another plane</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TextInput value={planeMessage} onChangeText={setPlaneMessage} maxLength={160} multiline placeholder="Example: Coffee break? Tell me one good thing from your day." placeholderTextColor={colors.muted} style={[styles.planeInput, { borderColor: colors.border, backgroundColor: colors.surfaceSoft, color: colors.text }]} />
                <View style={styles.composerFooter}><Text style={[styles.counter, { color: colors.muted }]}>{planeMessage.length}/160</Text><Text style={[styles.skyText, { color: colors.teal }]}>Sent to one open desk</Text></View>
                <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.navy }]} onPress={handleSendPaperPlane} disabled={loading}>
                  <Text style={styles.primaryButtonText}>{loading ? "Sending…" : "Send paper plane"}</Text><Text style={[styles.arrow, { color: colors.mint }]}>↗</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickMatchButton} onPress={handleFindSomeone} disabled={loading}>
                  <Text style={[styles.quickMatchText, { color: colors.teal }]}>Or match me now</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
          <View style={styles.noteRow}><View style={[styles.noteDot, { backgroundColor: colors.green }]} /><Text style={[styles.noteText, { color: colors.muted }]}>Anonymous conversations. No profile sharing.</Text></View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Brand.colors.canvas },
  container: { flex: 1, paddingHorizontal: 22 },
  loadingScreen: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Brand.colors.canvas },
  topBar: { alignItems: "center", paddingTop: 16 },
  brand: { color: Brand.colors.teal, fontSize: 11, fontWeight: "800", letterSpacing: 1.5 },
  content: { flex: 1, justifyContent: "center", paddingBottom: 20 },
  stepRow: { flexDirection: "row", alignItems: "center", alignSelf: "center", marginBottom: 25 },
  stepActive: { width: 8, height: 8, borderRadius: 4, backgroundColor: Brand.colors.teal }, stepIdle: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#C8D1DC" }, stepLine: { width: 42, height: 1, backgroundColor: "#C8D1DC" },
  matchCard: { backgroundColor: Brand.colors.surface, borderRadius: Brand.radius.card, padding: 25, borderWidth: 1, borderColor: Brand.colors.border },
  flightLane: { height: 26, overflow: "hidden", marginHorizontal: -25, marginTop: -16, marginBottom: 8 }, flyingPlane: { color: Brand.colors.teal, fontSize: 23 },
  iconTile: { width: 54, height: 54, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: Brand.colors.tealSoft }, iconText: { color: Brand.colors.teal, fontSize: 16, fontWeight: "800" },
  eyebrow: { color: Brand.colors.teal, fontSize: 10, fontWeight: "800", letterSpacing: 1.1, marginTop: 25 }, title: { color: Brand.colors.navy, fontSize: 28, fontWeight: "800", lineHeight: 34, marginTop: 10 }, subtitle: { color: Brand.colors.muted, fontSize: 15, lineHeight: 22, marginTop: 12 },
  planeInput: { borderWidth: 1, borderColor: Brand.colors.border, backgroundColor: "#FBFCFD", borderRadius: 12, color: Brand.colors.text, fontSize: 14, lineHeight: 20, minHeight: 82, padding: 12, paddingTop: 12, textAlignVertical: "top", marginTop: 20 }, composerFooter: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 }, counter: { color: Brand.colors.muted, fontSize: 10, fontWeight: "700" }, skyText: { color: Brand.colors.teal, fontSize: 10, fontWeight: "700" },
  primaryButton: { minHeight: 54, backgroundColor: Brand.colors.navy, borderRadius: Brand.radius.control, paddingHorizontal: 18, marginTop: 27, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" }, arrow: { color: Brand.colors.mint, fontSize: 24, fontWeight: "700" },
  secondaryButton: { minHeight: 54, backgroundColor: Brand.colors.surface, borderRadius: Brand.radius.control, borderWidth: 1, borderColor: Brand.colors.border, marginTop: 27, alignItems: "center", justifyContent: "center" }, secondaryButtonText: { color: Brand.colors.danger, fontSize: 16, fontWeight: "800" },
  quickMatchButton: { alignSelf: "center", paddingVertical: 13 }, quickMatchText: { color: Brand.colors.teal, fontSize: 13, fontWeight: "800" },
  noteRow: { flexDirection: "row", alignItems: "center", alignSelf: "center", marginTop: 19 }, noteDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Brand.colors.green, marginRight: 7 }, noteText: { color: Brand.colors.muted, fontSize: 12 },
});
