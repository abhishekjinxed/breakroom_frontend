import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, RefreshControl, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Brand } from "../constants/brand";
import { addNote, createPulse, getPulses, toggleApplaud, WorkPulse } from "../api/pulses";
import { useAuth } from "../context/AuthContext";
import { pickAndUploadMedia } from "../services/cloudinary";
import { blockUser, reportContent } from "../api/safety";
import * as Location from "expo-location";

export default function OfficePulseScreen() {
  const { token } = useAuth();
  const [pulses, setPulses] = useState<WorkPulse[]>([]);
  const [text, setText] = useState("");
  const [media, setMedia] = useState<{ mediaUrl: string; mediaType: "IMAGE" } | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [noteText, setNoteText] = useState<Record<string, string>>({});
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    try { setPulses(await getPulses(token)); } catch { Alert.alert("Office Pulse is unavailable", "Please try again shortly."); } finally { setLoading(false); }
  }, [token]);
  useEffect(() => { load(); }, [load]);

  async function chooseMedia() {
    try { const selection = await pickAndUploadMedia(60, false, undefined, true); if (selection?.mediaType === "IMAGE") setMedia({ mediaUrl: selection.mediaUrl, mediaType: "IMAGE" }); }
    catch (error: any) { Alert.alert("Couldn’t add media", error.message || "Check your Cloudinary configuration."); }
  }
  async function addLocation() {
    try {
      setLocating(true);
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") { Alert.alert("Location not shared", "Allow location access to attach your city or area to this Pulse."); return; }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [place] = await Location.reverseGeocodeAsync(position.coords);
      const label = [place?.city || place?.subregion, place?.region || place?.country].filter(Boolean).join(", ");
      if (!label) throw new Error("No area was found for this location.");
      setLocationLabel(label);
    } catch (error: any) { Alert.alert("Couldn’t add location", error?.message || "Please try again."); }
    finally { setLocating(false); }
  }
  async function publish() {
    if (!token || (!text.trim() && !media)) return;
    try {
      setPublishing(true);
      const pulse = await createPulse(token, { text: text.trim(), ...media, ...(locationLabel ? { locationLabel } : {}) });
      setPulses((current) => [pulse, ...current]); setText(""); setMedia(null); setLocationLabel(null);
    } catch { Alert.alert("Couldn’t share Work Pulse", "Please try again."); } finally { setPublishing(false); }
  }
  async function applaud(pulseId: string) {
    if (!token) return;
    const result = await toggleApplaud(token, pulseId);
    setPulses((current) => current.map((pulse) => pulse.id === pulseId ? { ...pulse, applaudedByMe: result.applauded, _count: { ...pulse._count, applauds: result.applauds } } : pulse));
  }
  async function sendNote(pulseId: string) {
    const value = noteText[pulseId]?.trim(); if (!token || !value) return;
    const note = await addNote(token, pulseId, value);
    setPulses((current) => current.map((pulse) => pulse.id === pulseId ? { ...pulse, notes: [...pulse.notes, note] } : pulse));
    setNoteText((current) => ({ ...current, [pulseId]: "" }));
  }
  async function reportPulse(pulseId: string) { if (!token) return; try { await reportContent(token, "PULSE", pulseId, "Inappropriate workplace content"); Alert.alert("Report received", "Thank you. Our moderation team will review it."); } catch { Alert.alert("Couldn’t submit report", "Please try again."); } }
  function safetyActions(item: WorkPulse) { Alert.alert("Safety tools", "Choose an action for this community update.", [{ text: "Report content", style: "destructive", onPress: () => reportPulse(item.id) }, { text: "Block member", style: "destructive", onPress: async () => { if (!token) return; await blockUser(token, item.author.id); setPulses((current) => current.filter((pulse) => pulse.author.id !== item.author.id)); } }, { text: "Cancel", style: "cancel" }]); }

  return <SafeAreaView style={styles.safeArea}>
    <View style={styles.header}><TouchableOpacity onPress={() => router.replace("/")}><Text style={styles.back}>← Dashboard</Text></TouchableOpacity><Text style={styles.brand}>OFFICE PULSE</Text></View>
    <FlatList data={pulses} keyExtractor={(item) => item.id} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={Brand.colors.teal} />}
      contentContainerStyle={styles.list} ListHeaderComponent={<View style={styles.composer}>
        <Text style={styles.composerTitle}>Share a Work Pulse</Text><TextInput value={text} onChangeText={setText} placeholder="What are you working on or taking a break from?" placeholderTextColor={Brand.colors.muted} style={styles.composerInput} multiline maxLength={160} />
        <View style={styles.characterRow}><Text style={styles.characterHelp}>Text or one photo</Text><Text style={styles.characterCount}>{text.length}/160</Text></View>
        {media && <View style={styles.attachment}><Text style={styles.attachmentText}>Photo attached</Text><TouchableOpacity onPress={() => setMedia(null)}><Text style={styles.remove}>Remove</Text></TouchableOpacity></View>}
        {locationLabel && <View style={styles.attachment}><Text style={styles.attachmentText}>⌖ {locationLabel}</Text><TouchableOpacity onPress={() => setLocationLabel(null)}><Text style={styles.remove}>Remove</Text></TouchableOpacity></View>}
        <View style={styles.composerActions}><View style={styles.utilityActions}><TouchableOpacity onPress={chooseMedia}><Text style={styles.mediaAction}>＋ Add photo</Text></TouchableOpacity><TouchableOpacity disabled={locating} onPress={addLocation}><Text style={styles.mediaAction}>{locating ? "Locating…" : "⌖ Add area"}</Text></TouchableOpacity></View><TouchableOpacity onPress={publish} disabled={publishing || (!text.trim() && !media)} style={styles.shareButton}><Text style={styles.shareButtonText}>{publishing ? "Sharing…" : "Share pulse"}</Text></TouchableOpacity></View>
      </View>}
      ListEmptyComponent={loading ? <ActivityIndicator color={Brand.colors.teal} /> : <Text style={styles.empty}>No Work Pulses yet. Start the conversation.</Text>}
      renderItem={({ item }) => <View style={styles.card}>
        <View style={styles.authorRow}><TouchableOpacity onPress={() => router.push({ pathname: "/profile/[userId]", params: { userId: item.author.id } } as any)}><Text style={styles.author}>{item.author.anonymousUsername}</Text><View style={styles.pulseMeta}><Text style={styles.time}>WORK PULSE</Text>{!!item.locationLabel && <View style={styles.locationPill}><Text style={styles.locationPillText}>⌖ {item.locationLabel}</Text></View>}</View></TouchableOpacity><TouchableOpacity onPress={() => safetyActions(item)}><Text style={styles.more}>•••</Text></TouchableOpacity></View>
        {!!item.text && <Text style={styles.pulseText}>{item.text}</Text>}
        {item.mediaUrl && item.mediaType === "IMAGE" && <Image source={{ uri: item.mediaUrl }} style={styles.media} resizeMode="cover" />}
        <View style={styles.reactionRow}><TouchableOpacity onPress={() => applaud(item.id)}><Text style={[styles.applaud, item.applaudedByMe && styles.applauded]}>{item.applaudedByMe ? "Applauded" : "Applaud"} · {item._count.applauds}</Text></TouchableOpacity><Text style={styles.notesCount}>{item.notes.length} Notes</Text></View>
        {item.notes.map((note) => <View key={note.id} style={styles.note}><TouchableOpacity onPress={() => router.push({ pathname: "/profile/[userId]", params: { userId: note.author.id } } as any)}><Text style={styles.noteAuthor}>{note.author.anonymousUsername}</Text></TouchableOpacity><Text style={styles.noteText}>{note.text}</Text></View>)}
        <View style={styles.noteComposer}><TextInput value={noteText[item.id] ?? ""} onChangeText={(value) => setNoteText((current) => ({ ...current, [item.id]: value }))} placeholder="Add a note" placeholderTextColor={Brand.colors.muted} style={styles.noteInput} maxLength={500} onSubmitEditing={() => sendNote(item.id)} /><TouchableOpacity onPress={() => sendNote(item.id)}><Text style={styles.noteSend}>Send</Text></TouchableOpacity></View>
      </View>}/>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Brand.colors.canvas }, header: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: Brand.colors.surface, borderBottomWidth: 1, borderColor: Brand.colors.border }, back: { color: Brand.colors.navyMuted, fontSize: 14, fontWeight: "700" }, brand: { color: Brand.colors.teal, fontSize: 11, fontWeight: "800", letterSpacing: 1.3 }, list: { padding: 16, gap: 14 }, composer: { backgroundColor: Brand.colors.surface, borderRadius: Brand.radius.card, padding: 18, borderWidth: 1, borderColor: Brand.colors.border, marginBottom: 2 }, composerTitle: { color: Brand.colors.navy, fontWeight: "800", fontSize: 17 }, composerInput: { color: Brand.colors.text, fontSize: 15, lineHeight: 21, minHeight: 74, paddingTop: 12 }, characterRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 }, characterHelp: { color: Brand.colors.muted, fontSize: 11 }, characterCount: { color: Brand.colors.muted, fontSize: 11, fontWeight: "700" }, composerActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 }, utilityActions: { gap: 8 }, mediaAction: { color: Brand.colors.teal, fontWeight: "700", fontSize: 13 }, shareButton: { backgroundColor: Brand.colors.navy, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10 }, shareButtonText: { color: "#FFF", fontSize: 13, fontWeight: "800" }, attachment: { flexDirection: "row", justifyContent: "space-between", backgroundColor: Brand.colors.tealSoft, padding: 10, borderRadius: 10, marginTop: 10 }, attachmentText: { color: Brand.colors.teal, fontWeight: "700", fontSize: 13 }, remove: { color: Brand.colors.danger, fontWeight: "700", fontSize: 13 }, card: { backgroundColor: Brand.colors.surface, borderRadius: Brand.radius.card, padding: 18, borderWidth: 1, borderColor: Brand.colors.border }, authorRow: { flexDirection: "row", justifyContent: "space-between" }, author: { color: Brand.colors.navy, fontWeight: "800", fontSize: 15 }, more: { color: Brand.colors.muted, fontWeight: "800", letterSpacing: 2 }, pulseMeta: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 7, marginTop: 4 }, time: { color: Brand.colors.teal, fontWeight: "800", fontSize: 10, letterSpacing: 1 }, locationPill: { backgroundColor: Brand.colors.tealSoft, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 }, locationPillText: { color: Brand.colors.teal, fontSize: 11, fontWeight: "800" }, pulseText: { color: Brand.colors.text, fontSize: 15, lineHeight: 22, marginTop: 13 }, media: { width: "100%", height: 220, borderRadius: 14, marginTop: 14, backgroundColor: Brand.colors.border }, reactionRow: { flexDirection: "row", marginTop: 15, gap: 18 }, applaud: { color: Brand.colors.muted, fontWeight: "700", fontSize: 13 }, applauded: { color: Brand.colors.teal }, notesCount: { color: Brand.colors.muted, fontWeight: "700", fontSize: 13 }, note: { marginTop: 12, backgroundColor: "#F7F9FB", padding: 10, borderRadius: 10 }, noteAuthor: { color: Brand.colors.navyMuted, fontSize: 12, fontWeight: "800" }, noteText: { color: Brand.colors.text, fontSize: 13, marginTop: 3 }, noteComposer: { flexDirection: "row", alignItems: "center", marginTop: 12, borderTopWidth: 1, borderColor: Brand.colors.border, paddingTop: 10 }, noteInput: { flex: 1, color: Brand.colors.text, fontSize: 13 }, noteSend: { color: Brand.colors.teal, fontWeight: "800", fontSize: 13, paddingLeft: 12 }, empty: { color: Brand.colors.muted, textAlign: "center", paddingTop: 60 },
});
