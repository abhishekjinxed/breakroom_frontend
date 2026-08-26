import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Dimensions, FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { createPulse, getPulses, WorkPulse } from "../api/pulses";
import { useAuth } from "../context/AuthContext";
import { Brand } from "../constants/brand";
import { pickAndUploadMedia } from "../services/cloudinary";

const height = Dimensions.get("window").height;
function playableVideoUrl(url: string) {
  // Ensure Cloudinary delivers an H.264/AAC MP4 that browser video elements can play.
  return url.includes("/video/upload/")
    ? url.replace("/video/upload/", "/video/upload/f_mp4,vc_h264,ac_aac/")
    : url;
}
function Brief({ item, active }: { item: WorkPulse; active: boolean }) {
  const player = useVideoPlayer(playableVideoUrl(item.mediaUrl!), (video) => { video.loop = true; video.muted = true; });
  useEffect(() => { if (active) player.play(); else player.pause(); }, [active, player]);
  return <View style={styles.page}><VideoView player={player} style={styles.video} playsInline contentFit="cover" /><View pointerEvents="none" style={styles.shade} /><View pointerEvents="none" style={styles.overlay}><Text style={styles.brand}>BREAK BRIEFS</Text><Text style={styles.author}>{item.author.anonymousUsername}</Text><Text style={styles.text}>{item.text}</Text><Text style={styles.hint}>Swipe for the next brief</Text></View></View>;
}
export default function BreakBriefs() {
  const { token } = useAuth(); const [briefs, setBriefs] = useState<WorkPulse[]>([]); const [caption, setCaption] = useState(""); const [progress, setProgress] = useState<number | null>(null); const [activeId, setActiveId] = useState<string | null>(null);
  const load = useCallback(async () => { if (token) setBriefs(await getPulses(token, true)); }, [token]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (!activeId && briefs.length) setActiveId(briefs[0].id); }, [activeId, briefs]);
  async function uploadBrief() { if (!token) return; if (!caption.trim()) { Alert.alert("Caption required", "Add a short caption before sharing your Break Brief."); return; } try { setProgress(0); const media = await pickAndUploadMedia(10, true, setProgress); if (!media) return; const brief = await createPulse(token, { text: caption.trim(), ...media, isBreakBrief: true }); setBriefs((current) => [brief, ...current]); setCaption(""); } catch (error: any) { Alert.alert("Couldn’t share Break Brief", error?.message || "Please try again."); } finally { setProgress(null); } }
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 80 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<{ item: WorkPulse }> }) => { if (viewableItems[0]?.item?.id) setActiveId(viewableItems[0].item.id); }).current;
  const videos = briefs.filter((item) => item.mediaType === "VIDEO");
  return <SafeAreaView style={styles.safe}><FlatList data={videos} renderItem={({ item }) => <Brief item={item} active={item.id === activeId} />} pagingEnabled decelerationRate="fast" showsVerticalScrollIndicator={false} keyExtractor={(item) => item.id} viewabilityConfig={viewabilityConfig} onViewableItemsChanged={onViewableItemsChanged} getItemLayout={(_, index) => ({ length: height, offset: height * index, index })} ListEmptyComponent={<Text style={styles.empty}>No Break Briefs yet.</Text>} /><View style={styles.upload}><TextInput value={caption} onChangeText={setCaption} placeholder="Add a caption" placeholderTextColor="#9CA3AF" style={styles.caption} maxLength={200} /><TouchableOpacity onPress={uploadBrief}><Text style={styles.uploadText}>Share 10-sec Brief</Text></TouchableOpacity>{progress !== null && <View style={styles.track}><View style={[styles.progress, { width: `${progress * 100}%` }]} /></View>}</View></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: "#000" }, page: { height, backgroundColor: "#000" }, video: { flex: 1 }, shade: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.14)" }, overlay: { position: "absolute", left: 20, right: 20, bottom: 70 }, brand: { color: Brand.colors.mint, fontSize: 11, fontWeight: "800", letterSpacing: 1.4 }, author: { color: "#FFF", fontSize: 17, fontWeight: "800", marginTop: 10 }, text: { color: "#FFF", fontSize: 14, marginTop: 6 }, hint: { color: "rgba(255,255,255,0.75)", fontSize: 11, marginTop: 12 }, empty: { color: "#FFF", textAlign: "center", marginTop: 80 }, upload: { position: "absolute", left: 16, right: 16, top: 16, backgroundColor: "rgba(23,43,77,0.92)", padding: 10, borderRadius: 12 }, caption: { color: "#FFF", padding: 6 }, uploadText: { color: Brand.colors.mint, fontSize: 12, fontWeight: "800", padding: 6 }, track: { height: 4, backgroundColor: "#334155", borderRadius: 2, marginTop: 6 }, progress: { height: 4, backgroundColor: Brand.colors.mint, borderRadius: 2 } });
