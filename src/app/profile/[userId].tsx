import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Linking, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { getPublicProfile, PublicProfile } from "../../api/users";
import { requestWorkCircle } from "../../api/work-circle";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function PublicProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { token } = useAuth();
  const { colors } = useTheme();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    if (!token || !userId) return;
    try { setProfile(await getPublicProfile(token, userId)); }
    catch { Alert.alert("Profile unavailable", "This member is unavailable or has restricted their profile.", [{ text: "Back", onPress: () => router.back() }]); }
    finally { setLoading(false); }
  }, [token, userId]);
  useEffect(() => { load(); }, [load]);

  function connect() { if (!token || !userId) return; Alert.alert("Send connection request", "Choose how you would like to reach out.", [{ text: "Cancel", style: "cancel" }, { text: "Send Plane", onPress: () => send("PLANE") }, { text: "Request Empty Desk", onPress: () => send("EMPTY_DESK") }]); }
  async function send(requestType: "PLANE" | "EMPTY_DESK") { if (!token || !userId || sending) return; try { setSending(true); const result = await requestWorkCircle(token, userId, requestType); Alert.alert("Request sent", result.message ?? "Your connection request is awaiting a response."); } catch (error: any) { Alert.alert("Connection request", error?.response?.data?.message ?? "Please try again."); } finally { setSending(false); } }


  if (loading) return <SafeAreaView style={[styles.safe, { backgroundColor: colors.canvas }]}><ActivityIndicator style={styles.loader} color={colors.teal} /></SafeAreaView>;
  if (!profile) return null;
  const memberSince = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(new Date(profile.createdAt));
  return <SafeAreaView style={[styles.safe, { backgroundColor: colors.canvas }]}><View style={styles.content}>
    <TouchableOpacity onPress={() => router.back()}><Text style={[styles.back, { color: colors.teal }]}>← Back</Text></TouchableOpacity>
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.avatar, { backgroundColor: colors.violetSoft }]}><Text style={[styles.initial, { color: colors.violet }]}>{profile.anonymousUsername.charAt(0).toUpperCase()}</Text></View>
      <Text style={[styles.name, { color: colors.navy }]}>{profile.anonymousUsername}</Text>
      <Text style={[styles.memberSince, { color: colors.muted }]}>Breakroom member since {memberSince}</Text>
      {!!profile.bio && <Text style={[styles.bio, { color: colors.text }]}>{profile.bio}</Text>}
      {(!!profile.gender || profile.age !== null) && <View style={styles.tags}>{profile.age !== null && <View style={[styles.tag, { backgroundColor: colors.violetSoft }]}><Text style={[styles.tagText, { color: colors.violet }]}>Age {profile.age}</Text></View>}{!!profile.gender && <View style={[styles.tag, { backgroundColor: colors.tealSoft }]}><Text style={[styles.tagText, { color: colors.teal }]}>{profile.gender}</Text></View>}</View>}
      {!!profile.socialLink && <TouchableOpacity onPress={() => Linking.openURL(profile.socialLink!)} style={[styles.linkButton, { borderColor: colors.border }]}><Text style={[styles.linkText, { color: colors.violet }]}>Open social profile ↗</Text></TouchableOpacity>}
      <TouchableOpacity disabled={sending} onPress={connect} style={[styles.connectButton, { backgroundColor: colors.navy }, sending && styles.disabled]}><Text style={styles.connectText}>{sending ? "Sending…" : "Send Plane / Empty Desk"}</Text></TouchableOpacity>
      {!profile.bio && !profile.gender && !profile.socialLink && <Text style={[styles.empty, { color: colors.muted }]}>This member has not shared any profile details yet.</Text>}
    </View>
  </View></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, content: { padding: 22 }, back: { fontWeight: "800", fontSize: 14 }, loader: { marginTop: 80 }, card: { marginTop: 26, padding: 24, borderRadius: 22, borderWidth: 1, alignItems: "center" }, avatar: { height: 72, width: 72, borderRadius: 24, alignItems: "center", justifyContent: "center" }, initial: { fontSize: 30, fontWeight: "900" }, name: { fontSize: 24, fontWeight: "900", marginTop: 16 }, memberSince: { fontSize: 12, marginTop: 6 }, bio: { alignSelf: "stretch", fontSize: 15, lineHeight: 22, marginTop: 22, textAlign: "center" }, tags: { flexDirection: "row", gap: 8, marginTop: 16, flexWrap: "wrap", justifyContent: "center" }, tag: { borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 }, tagText: { fontWeight: "800", fontSize: 12 }, linkButton: { alignSelf: "stretch", borderWidth: 1, borderRadius: 12, padding: 13, marginTop: 20, alignItems: "center" }, linkText: { fontWeight: "800" }, connectButton: { alignSelf: "stretch", padding: 14, alignItems: "center", borderRadius: 12, marginTop: 14 }, connectText: { color: "#FFF", fontWeight: "900" }, disabled: { opacity: .55 }, empty: { fontSize: 14, marginTop: 22, textAlign: "center", lineHeight: 20 },
});
