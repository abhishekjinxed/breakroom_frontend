import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Linking, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { getPublicProfile, PublicProfile } from "../../api/users";
import { requestWorkCircle } from "../../api/work-circle";
import { reportContent } from "../../api/safety";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function PublicProfileScreen() {
  const { userId, fromChat } = useLocalSearchParams<{ userId: string; fromChat?: string }>();
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
  async function reportMember() { if (!token || !userId) return; try { await reportContent(token, "USER", userId, "Inappropriate member profile"); Alert.alert("Report received", "Thank you. A moderator will review it."); } catch { Alert.alert("Couldn’t report member", "Please try again."); } }


  if (loading) return <SafeAreaView style={[styles.safe, { backgroundColor: colors.canvas }]}><ActivityIndicator style={styles.loader} color={colors.teal} /></SafeAreaView>;
  if (!profile) return null;
  const memberSince = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(new Date(profile.createdAt));
  return <SafeAreaView style={[styles.safe, { backgroundColor: colors.canvas }]}><View style={styles.content}>
    <TouchableOpacity onPress={() => router.back()}><Text style={[styles.back, { color: colors.teal }]}>← Back</Text></TouchableOpacity>
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.avatar, { backgroundColor: colors.violetSoft }]}><Text style={[styles.initial, { color: colors.violet }]}>{profile.anonymousUsername.charAt(0).toUpperCase()}</Text></View>
      <Text style={[styles.name, { color: colors.navy }]}>{profile.anonymousUsername}</Text>
      <Text style={[styles.memberSince, { color: colors.muted }]}>Breakroom member since {memberSince}</Text>
      {!!profile.limitedProfile && <Text style={[styles.limited, { color: colors.muted }]}>Only this member’s public Desk Notes are shown. Their private profile details are hidden.</Text>}
      {!!profile.photos?.length && <View style={styles.photos}>{profile.photos.map((photo) => <Image key={photo.id} source={{ uri: photo.url }} style={[styles.photoImage, { borderColor: colors.border }]} />)}</View>}
      {!!profile.bio && <Text style={[styles.bio, { color: colors.text }]}>{profile.bio}</Text>}
      {(!!profile.gender || profile.age !== null) && <View style={styles.tags}>{profile.age !== null && <View style={[styles.tag, { backgroundColor: colors.violetSoft }]}><Text style={[styles.tagText, { color: colors.violet }]}>Age {profile.age}</Text></View>}{!!profile.gender && <View style={[styles.tag, { backgroundColor: colors.tealSoft }]}><Text style={[styles.tagText, { color: colors.teal }]}>{profile.gender}</Text></View>}</View>}
      {!!profile.socialLink && <TouchableOpacity onPress={() => Linking.openURL(profile.socialLink!)} style={[styles.linkButton, { borderColor: colors.border }]}><Text style={[styles.linkText, { color: colors.violet }]}>Open social profile ↗</Text></TouchableOpacity>}
      {fromChat !== "1" && <TouchableOpacity disabled={sending} onPress={connect} style={[styles.connectButton, { backgroundColor: colors.navy }, sending && styles.disabled]}><Text style={styles.connectText}>{sending ? "Sending…" : "Send Plane / Empty Desk"}</Text></TouchableOpacity>}
      <TouchableOpacity onPress={reportMember} style={styles.reportMember}><Text style={[styles.reportMemberText, { color: colors.danger }]}>Report member</Text></TouchableOpacity>
      {!!profile.deskNotes?.length && <View style={[styles.notesSection, { borderColor: colors.border }]}><Text style={[styles.notesTitle, { color: colors.text }]}>Public Desk Notes</Text>{profile.deskNotes.map((note) => <View key={note.id} style={[styles.publicNote, { backgroundColor: colors.amberSoft }]}><Text style={[styles.publicNoteText, { color: colors.text }]}>{note.text}</Text><Text style={[styles.publicNoteMeta, { color: colors.violet }]}>{note._count.applauds} applause · {note._count.comments} comments</Text></View>)}</View>}
      {!profile.bio && !profile.gender && !profile.socialLink && <Text style={[styles.empty, { color: colors.muted }]}>This member has not shared any profile details yet.</Text>}
    </View>
  </View></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, content: { padding: 22 }, back: { fontWeight: "800", fontSize: 14 }, loader: { marginTop: 80 }, card: { marginTop: 26, padding: 24, borderRadius: 22, borderWidth: 1, alignItems: "center" }, avatar: { height: 72, width: 72, borderRadius: 24, alignItems: "center", justifyContent: "center" }, initial: { fontSize: 30, fontWeight: "900" }, name: { fontSize: 24, fontWeight: "900", marginTop: 16 }, memberSince: { fontSize: 12, marginTop: 6 }, limited: { alignSelf: "stretch", textAlign: "center", fontSize: 12, lineHeight: 18, marginTop: 13 }, photos: { flexDirection: "row", gap: 9, alignSelf: "stretch", marginTop: 17 }, photoImage: { flex: 1, aspectRatio: 1, borderRadius: 13, borderWidth: 1, backgroundColor: "#EEE" }, bio: { alignSelf: "stretch", fontSize: 15, lineHeight: 22, marginTop: 22, textAlign: "center" }, tags: { flexDirection: "row", gap: 8, marginTop: 16, flexWrap: "wrap", justifyContent: "center" }, tag: { borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 }, tagText: { fontWeight: "800", fontSize: 12 }, linkButton: { alignSelf: "stretch", borderWidth: 1, borderRadius: 12, padding: 13, marginTop: 20, alignItems: "center" }, linkText: { fontWeight: "800" }, connectButton: { alignSelf: "stretch", padding: 14, alignItems: "center", borderRadius: 12, marginTop: 14 }, connectText: { color: "#FFF", fontWeight: "900" }, reportMember: { alignSelf: "center", padding: 11, marginTop: 6 }, reportMemberText: { fontSize: 12, fontWeight: "900" }, disabled: { opacity: .55 }, notesSection: { alignSelf: "stretch", borderTopWidth: 1, marginTop: 20, paddingTop: 17 }, notesTitle: { fontSize: 15, fontWeight: "900", alignSelf: "flex-start" }, publicNote: { alignSelf: "stretch", borderRadius: 9, padding: 11, marginTop: 10 }, publicNoteText: { fontSize: 13, lineHeight: 19, fontWeight: "700" }, publicNoteMeta: { fontSize: 10, fontWeight: "800", marginTop: 7 }, empty: { fontSize: 14, marginTop: 22, textAlign: "center", lineHeight: 20 },
});
