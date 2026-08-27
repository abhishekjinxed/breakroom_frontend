import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Dimensions, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useEvent } from "expo";
import { VideoView, useVideoPlayer } from "expo-video";
import { createPulse, getPulses, WorkPulse } from "../api/pulses";
import { useAuth } from "../context/AuthContext";
import { Brand } from "../constants/brand";
import { pickAndUploadMedia } from "../services/cloudinary";

const height = Dimensions.get("window").height;

function playableVideoUrl(url: string) {
  // Ensure Cloudinary delivers an H.264/AAC MP4 supported by Android, iOS, and web.
  return url.includes("/video/upload/") ? url.replace("/video/upload/", "/video/upload/f_mp4,vc_h264,ac_aac/") : url;
}

function Brief({ item, active }: { item: WorkPulse; active: boolean }) {
  const [held, setHeld] = useState(false);
  const heldRef = useRef(false);
  const player = useVideoPlayer(playableVideoUrl(item.mediaUrl!), (video) => { video.loop = true; video.muted = false; video.timeUpdateEventInterval = 0.1; });
  const timeUpdate = useEvent(player, "timeUpdate", { currentTime: 0, bufferedPosition: 0, currentLiveTimestamp: null, currentOffsetFromLive: null });
  const currentTime = timeUpdate?.currentTime ?? 0;
  const duration = Number.isFinite(player.duration) && player.duration > 0 ? player.duration : 10;
  const remaining = Math.max(0, Math.ceil(duration - currentTime));
  const progress = Math.min(100, Math.max(0, (currentTime / duration) * 100));

  useEffect(() => { if (active) player.play(); else player.pause(); }, [active, player]);

  function pauseWhileHeld() {
    if (!active) return;
    heldRef.current = true;
    setHeld(true);
    player.pause();
  }

  function resumeAfterHold() {
    if (!heldRef.current) return;
    heldRef.current = false;
    setHeld(false);
    if (active) player.play();
  }

  return <Pressable style={styles.page} delayLongPress={180} onLongPress={pauseWhileHeld} onPressOut={resumeAfterHold}>
    <VideoView player={player} style={styles.video} nativeControls={false} playsInline contentFit="cover" surfaceType="textureView" />
    <View pointerEvents="none" style={styles.shade} />
    <View pointerEvents="none" style={styles.playbackProgress}><View style={[styles.playbackProgressFill, { width: `${progress}%` }]} /></View>
    <View pointerEvents="none" style={styles.timer}><Text style={styles.timerText}>{remaining}s</Text><Text style={styles.timerLabel}>remaining</Text></View>
    {held && <View pointerEvents="none" style={styles.pauseBadge}><Text style={styles.pauseIcon}>Ⅱ</Text><Text style={styles.pauseText}>Paused</Text></View>}
    <View pointerEvents="none" style={styles.overlay}><Text style={styles.brand}>BREAK BRIEFS</Text><Text style={styles.author}>{item.author.anonymousUsername}</Text><Text style={styles.text}>{item.text}</Text><Text style={styles.hint}>Hold to pause · Swipe for the next brief</Text></View>
  </Pressable>;
}

export default function BreakBriefs() {
  const { token } = useAuth();
  const [briefs, setBriefs] = useState<WorkPulse[]>([]);
  const [caption, setCaption] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const load = useCallback(async () => { if (token) setBriefs(await getPulses(token, true)); }, [token]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (!activeId && briefs.length) setActiveId(briefs[0].id); }, [activeId, briefs]);

  async function uploadBrief() {
    if (!token) return;
    if (!caption.trim()) { Alert.alert("Caption required", "Add a short caption before sharing your Break Brief."); return; }
    try {
      setProgress(0);
      const media = await pickAndUploadMedia(10, true, setProgress);
      if (!media) return;
      const brief = await createPulse(token, { text: caption.trim(), ...media, isBreakBrief: true });
      setBriefs((current) => [brief, ...current]);
      setCaption(""); setComposerOpen(false); setActiveId(brief.id);
    } catch (error: any) { Alert.alert("Couldn’t share Break Brief", error?.message || "Please try again."); }
    finally { setProgress(null); }
  }

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 80 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<{ item: WorkPulse }> }) => { if (viewableItems[0]?.item?.id) setActiveId(viewableItems[0].item.id); }).current;
  const videos = briefs.filter((item) => item.mediaType === "VIDEO");
  return <SafeAreaView style={styles.safe}>
    <FlatList data={videos} renderItem={({ item }) => <Brief item={item} active={item.id === activeId} />} pagingEnabled decelerationRate="fast" showsVerticalScrollIndicator={false} keyExtractor={(item) => item.id} viewabilityConfig={viewabilityConfig} onViewableItemsChanged={onViewableItemsChanged} getItemLayout={(_, index) => ({ length: height, offset: height * index, index })} ListEmptyComponent={<Text style={styles.empty}>No Break Briefs yet. Start the first one.</Text>} />
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Create a Break Brief" style={styles.addButton} activeOpacity={0.85} onPress={() => setComposerOpen(true)}><Text style={styles.addIcon}>＋</Text></TouchableOpacity>
    <Modal visible={composerOpen} transparent animationType="slide" onRequestClose={() => !progress && setComposerOpen(false)}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalBackdrop}>
        <View style={styles.composer}>
          <View style={styles.composerHeader}><View><Text style={styles.composerEyebrow}>NEW BREAK BRIEF</Text><Text style={styles.composerTitle}>Share a 10-second workday moment</Text></View><TouchableOpacity disabled={progress !== null} onPress={() => setComposerOpen(false)}><Text style={styles.close}>×</Text></TouchableOpacity></View>
          <TextInput value={caption} onChangeText={setCaption} placeholder="Add a caption" placeholderTextColor="#64748B" style={styles.caption} maxLength={200} multiline />
          <TouchableOpacity disabled={progress !== null} onPress={uploadBrief} style={[styles.shareButton, progress !== null && styles.shareButtonDisabled]}><Text style={styles.shareButtonText}>{progress === null ? "Choose 10-sec video" : `Uploading ${Math.round(progress * 100)}%`}</Text></TouchableOpacity>
          {progress !== null && <View style={styles.track}><View style={[styles.progress, { width: `${Math.min(progress * 100, 100)}%` }]} /></View>}
          <Text style={styles.composerHelp}>Videos only · Maximum 10 seconds · Original audio plays in the brief</Text>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#000" }, page: { height, backgroundColor: "#000" }, video: { flex: 1 }, shade: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.18)" }, overlay: { position: "absolute", left: 20, right: 76, bottom: 90 }, brand: { color: Brand.colors.mint, fontSize: 11, fontWeight: "800", letterSpacing: 1.4 }, author: { color: "#FFF", fontSize: 17, fontWeight: "800", marginTop: 10 }, text: { color: "#FFF", fontSize: 14, marginTop: 6 }, hint: { color: "rgba(255,255,255,0.8)", fontSize: 11, marginTop: 12 }, empty: { color: "#FFF", textAlign: "center", marginTop: 80, paddingHorizontal: 30 }, playbackProgress: { position: "absolute", top: 12, left: 16, right: 16, height: 4, borderRadius: 3, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.28)" }, playbackProgressFill: { height: "100%", borderRadius: 3, backgroundColor: Brand.colors.mint }, timer: { position: "absolute", top: 26, right: 18, alignItems: "flex-end" }, timerText: { color: "#FFF", fontSize: 16, fontWeight: "900" }, timerLabel: { color: "rgba(255,255,255,0.78)", fontSize: 9, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6 },
  pauseBadge: { position: "absolute", top: "44%", alignSelf: "center", alignItems: "center", backgroundColor: "rgba(15,23,42,0.72)", borderRadius: 14, paddingHorizontal: 18, paddingVertical: 12 }, pauseIcon: { color: "#FFF", fontSize: 24, fontWeight: "800" }, pauseText: { color: "#FFF", fontSize: 11, fontWeight: "800", marginTop: 2 }, addButton: { position: "absolute", right: 20, bottom: 92, width: 54, height: 54, borderRadius: 27, backgroundColor: Brand.colors.mint, alignItems: "center", justifyContent: "center", elevation: 5, shadowColor: "#000", shadowOpacity: 0.28, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } }, addIcon: { color: Brand.colors.navy, fontSize: 32, fontWeight: "400", lineHeight: 35 },
  modalBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.55)" }, composer: { backgroundColor: "#FFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, paddingBottom: 28 }, composerHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }, composerEyebrow: { color: Brand.colors.teal, fontSize: 10, fontWeight: "900", letterSpacing: 1.2 }, composerTitle: { color: Brand.colors.navy, fontSize: 18, fontWeight: "800", marginTop: 4, maxWidth: 280 }, close: { color: "#475569", fontSize: 30, lineHeight: 28 }, caption: { minHeight: 84, borderWidth: 1, borderColor: "#D9E2EC", borderRadius: 12, color: Brand.colors.navy, padding: 12, textAlignVertical: "top", marginTop: 18 }, shareButton: { backgroundColor: Brand.colors.navy, minHeight: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 12 }, shareButtonDisabled: { opacity: 0.65 }, shareButtonText: { color: "#FFF", fontSize: 14, fontWeight: "800" }, track: { height: 5, backgroundColor: "#D9E2EC", borderRadius: 3, marginTop: 12, overflow: "hidden" }, progress: { height: "100%", backgroundColor: Brand.colors.teal, borderRadius: 3 }, composerHelp: { color: "#64748B", fontSize: 11, lineHeight: 16, marginTop: 10 },
});
