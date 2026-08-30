import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

import { joinBored, stopLooking } from "../api/bored";
import { Brand } from "../constants/brand";
import { useAuth } from "../context/AuthContext";
import { getSocket } from "../services/socket";

type ScreenState = "READY" | "SEARCHING" | "MATCHED";

export default function BoredScreen() {
  const { user, token } = useAuth();
  const [state, setState] = useState<ScreenState>("READY");
  const [loading, setLoading] = useState(false);
  const matchedRef = useRef(false);

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

  if (!user) {
    return <View style={styles.loadingScreen}><ActivityIndicator color={Brand.colors.teal} size="large" /></View>;
  }

  const isSearching = state === "SEARCHING";
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Text style={styles.brand}>BREAKROOM</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.stepRow}>
            <View style={styles.stepActive} /><View style={styles.stepLine} />
            <View style={isSearching ? styles.stepActive : styles.stepIdle} /><View style={styles.stepLine} />
            <View style={styles.stepIdle} />
          </View>
          <View style={styles.matchCard}>
            <View style={styles.iconTile}>
              {isSearching ? <ActivityIndicator color={Brand.colors.teal} /> : <Text style={styles.iconText}>BR</Text>}
            </View>
            <Text style={styles.eyebrow}>{isSearching ? "MATCHING IN PROGRESS" : "WORKDAY BREAK"}</Text>
            <Text style={styles.title}>{isSearching ? "Looking for a break partner" : "Ready to step away?"}</Text>
            <Text style={styles.subtitle}>
              {isSearching ? "We’ll connect you when another professional is ready for a quick conversation." : "Take a few minutes to reset, connect, and return to work refreshed."}
            </Text>
            {isSearching ? (
              <TouchableOpacity style={styles.secondaryButton} onPress={handleStopLooking} disabled={loading}>
                <Text style={styles.secondaryButtonText}>Cancel search</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.primaryButton} onPress={handleFindSomeone} disabled={loading}>
                <Text style={styles.primaryButtonText}>Find a break partner</Text><Text style={styles.arrow}>→</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.noteRow}><View style={styles.noteDot} /><Text style={styles.noteText}>Anonymous conversations. No profile sharing.</Text></View>
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
  iconTile: { width: 54, height: 54, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: Brand.colors.tealSoft }, iconText: { color: Brand.colors.teal, fontSize: 16, fontWeight: "800" },
  eyebrow: { color: Brand.colors.teal, fontSize: 10, fontWeight: "800", letterSpacing: 1.1, marginTop: 25 }, title: { color: Brand.colors.navy, fontSize: 28, fontWeight: "800", lineHeight: 34, marginTop: 10 }, subtitle: { color: Brand.colors.muted, fontSize: 15, lineHeight: 22, marginTop: 12 },
  primaryButton: { minHeight: 54, backgroundColor: Brand.colors.navy, borderRadius: Brand.radius.control, paddingHorizontal: 18, marginTop: 27, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" }, arrow: { color: Brand.colors.mint, fontSize: 24, fontWeight: "700" },
  secondaryButton: { minHeight: 54, backgroundColor: Brand.colors.surface, borderRadius: Brand.radius.control, borderWidth: 1, borderColor: Brand.colors.border, marginTop: 27, alignItems: "center", justifyContent: "center" }, secondaryButtonText: { color: Brand.colors.danger, fontSize: 16, fontWeight: "800" },
  noteRow: { flexDirection: "row", alignItems: "center", alignSelf: "center", marginTop: 19 }, noteDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Brand.colors.green, marginRight: 7 }, noteText: { color: Brand.colors.muted, fontSize: 12 },
});
