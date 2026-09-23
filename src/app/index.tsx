
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";

import { router } from "expo-router";

import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing } from "react-native";

WebBrowser.maybeCompleteAuthSession();
import { Brand } from "../constants/brand";
import { useTheme } from "../context/ThemeContext";
import { DeskPlanes } from "../components/PaperPlaneInbox";
import { DeskNotesTicker } from "../components/DeskNotesTicker";
import { getBreakroomPulse, getDeskQuote } from "../api/desk";
import { getWallet } from "../api/wallet";

export default function HomeScreen() {
  const { user, token, loading, loginWithGoogle, logout } = useAuth();
  const { t } = useLanguage();
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.canvas }]}>
        <ActivityIndicator size="large" />

        <Text style={[styles.loadingText, { color: colors.muted }]}>{t("loading")}</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.canvas }]}>
        <View style={[styles.loginContainer, { backgroundColor: colors.canvas }]}>
          <Text style={[styles.brand, { color: colors.teal }]}>BREAKROOM</Text>
          <Text style={[styles.loginTitle, { color: colors.navy }]}>{t("loginTitle")}</Text>
          <Text style={[styles.loginText, { color: colors.muted }]}>{t("loginText")}</Text>
          <GoogleLoginButton />
        </View>
      </SafeAreaView>
    );
  }

  return <FocusedHome username={user.anonymousUsername} profilePhotoUrl={user.publicAvatarUrl} token={token} colors={colors} onLogout={logout} />;

  function handleGettingBored() {
    router.push("/bored");
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.canvas }]}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.canvas }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.brand, { color: colors.teal }]}>BREAKROOM</Text>
            <Text style={[styles.greeting, { color: colors.muted }]}>{t("greeting")}</Text>
            <Text style={[styles.username, { color: colors.navy }]}>{user!.anonymousUsername}</Text>
          </View>

          <View style={styles.accountActions}>
            <View style={[styles.profileBadge, { backgroundColor: colors.tealSoft }]}>
              <Text style={[styles.profileInitial, { color: colors.teal }]}>
                {user!.anonymousUsername.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.accountLinks}><TouchableOpacity onPress={() => router.push("/account")}><Text style={[styles.logoutText, { color: colors.muted }]}>{t("account")}</Text></TouchableOpacity><TouchableOpacity onPress={logout}><Text style={[styles.logoutText, { color: colors.muted }]}>{t("signOut")}</Text></TouchableOpacity></View>
          </View>
        </View>

        <View style={[styles.statusRow, { backgroundColor: colors.greenSoft }]}>
          <View style={[styles.statusDot, { backgroundColor: colors.green }]} />
          <Text style={[styles.statusText, { color: colors.green }]}>{t("available")}</Text>
        </View>

        <View style={[styles.heroCard, { backgroundColor: colors.hero }]}>
          <View style={[styles.cardAccent, { backgroundColor: colors.heroAccent }]} />
          <Text style={[styles.eyebrow, { color: colors.mint }]}>{t("heroEyebrow")}</Text>
          <Text style={styles.title}>{t("heroTitle")}</Text>
          <Text style={styles.subtitle}>{t("heroText")}</Text>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.mint }]}
            activeOpacity={0.88}
            onPress={handleGettingBored}
          >
            <Text style={[styles.primaryButtonText, { color: colors.onAccent }]}>{t("findPartner")}</Text>
            <Text style={[styles.buttonArrow, { color: colors.onAccent }]}>→</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.footerText, { color: colors.muted }]}>{t("communitySafety")}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function pixelatedProfileUrl(url?: string | null) {
  if (!url) return null;
  return url.includes("res.cloudinary.com") ? url.replace("/upload/", "/upload/e_pixelate:12/") : url;
}

function FocusedHome({ username, profilePhotoUrl, token, colors, onLogout }: { username: string; profilePhotoUrl?: string | null; token: string | null; colors: any; onLogout: () => Promise<void> }) {
  const [quote, setQuote] = useState({ text: "Small progress is still progress.", author: "Breakroom" });
  const [wallet, setWallet] = useState<{ balance: number; paperPlaneCost: number } | null>(null);
  const [pulseOpen, setPulseOpen] = useState(false);
  const [onlineCount, setOnlineCount] = useState<number | null>(null);
  const [pulseLoading, setPulseLoading] = useState(false);
  useEffect(() => { getDeskQuote().then(setQuote).catch(() => undefined); }, []);
  useEffect(() => { if (token) getWallet(token).then(setWallet).catch(() => undefined); }, [token]);
  async function openPulse() {
    setPulseOpen(true);
    if (!token) return;
    try { setPulseLoading(true); setOnlineCount((await getBreakroomPulse(token)).onlineCount); } finally { setPulseLoading(false); }
  }
  return <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.canvas }]}><ScrollView contentContainerStyle={styles.focusedContent}>
    <View style={styles.focusedHeader}><View style={styles.focusedHeaderCopy}><Text style={[styles.brand, { color: colors.teal }]}>BREAKROOM</Text><Text numberOfLines={1} ellipsizeMode="tail" style={[styles.focusedTitle, { color: colors.navy }]}>Your desk, {username}</Text><Text style={[styles.focusedSub, { color: colors.muted }]}>Paper Planes land here when someone wants to connect.</Text></View><TouchableOpacity accessibilityRole="button" accessibilityLabel="Sign out" hitSlop={10} onPress={onLogout} style={styles.focusedLogoutButton}><Text numberOfLines={1} style={[styles.logoutText, { color: colors.muted }]}>Sign out</Text></TouchableOpacity></View>
    <View style={[styles.deskScene, { backgroundColor: colors.hero }]}><Text style={styles.window}>☕     ▣</Text><LiveLaptop /><TouchableOpacity accessibilityRole="button" accessibilityLabel="Open Breakroom pulse" onPress={openPulse} style={styles.deskLamp}><View style={styles.lampGlow} /><View style={styles.lampShade} /><View style={styles.lampStem} /><View style={styles.lampBase} /></TouchableOpacity><Text style={styles.pen}>╱</Text><DeskNotepad colors={colors} quote={quote} /><View style={styles.waterBottle}><View style={styles.bottleCap} /><View style={styles.bottleLabel}><Text style={styles.bottleLabelText}>H₂O</Text></View></View><View style={styles.headphones}><View style={styles.headphoneBand} /><View style={[styles.headphoneCup, styles.headphoneCupLeft]} /><View style={[styles.headphoneCup, styles.headphoneCupRight]} /></View><View style={styles.photoFrame}>{profilePhotoUrl ? <Image accessibilityLabel="Your pixelated profile photo" source={{ uri: pixelatedProfileUrl(profilePhotoUrl)! }} resizeMode="cover" style={styles.photoImage} /> : <Text style={styles.photo}>☕</Text>}<View pointerEvents="none" style={styles.photoPixelGrid} /></View><View style={[styles.deskTop, { backgroundColor: colors.heroAccent }]} /><DeskPlanes /><Text style={[styles.deskCaption, { color: colors.canvas }]}>Tap a landed Paper Plane to read it.</Text><TouchableOpacity onPress={() => router.push("/bored" as any)} style={[styles.sendPlaneButton, { backgroundColor: colors.teal }]}><Text style={[styles.sendPlaneText, { color: "#FFFFFF" }]}>Send a Paper Plane</Text></TouchableOpacity></View>
    {wallet && <View style={[styles.walletCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={styles.walletIcon}><Text style={styles.walletIconText}>₹</Text></View><View style={styles.walletCopy}><Text style={[styles.walletEyebrow, { color: colors.teal }]}>SALARY WALLET</Text><Text style={[styles.walletBalance, { color: colors.text }]}>{wallet.balance.toLocaleString("en-IN")} Paisa</Text><Text style={[styles.walletHint, { color: colors.muted }]}>A Paper Plane costs {wallet.paperPlaneCost} Paisa.</Text></View></View>}
    <View style={styles.gameSection}><Text style={[styles.gameSectionTitle, { color: colors.text }]}>Quick games</Text><Text style={[styles.gameSectionCopy, { color: colors.muted }]}>Take a short break without leaving your desk.</Text><View style={styles.gameRow}><TouchableOpacity onPress={() => router.push("/tic-tac-toe" as any)} style={[styles.gameTile, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.gameTileIcon, { color: colors.teal }]}>⊞</Text><Text style={[styles.gameTileTitle, { color: colors.text }]}>Tic-Tac-Toe</Text><Text style={[styles.gameTileText, { color: colors.muted }]}>Anonymous two-player match</Text></TouchableOpacity><TouchableOpacity onPress={() => router.push("/tetris" as any)} style={[styles.gameTile, { backgroundColor: colors.hero, borderColor: colors.heroAccent }]}><Text style={styles.gameTileIcon}>▦</Text><Text style={styles.gameTileDarkTitle}>Tetris</Text><Text style={styles.gameTileDarkText}>Solo score break</Text></TouchableOpacity></View></View>
    <DeskNotesTicker />
    <View style={[styles.workThoughtCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.workThoughtLabel, { color: colors.teal }]}>WORK THOUGHT</Text><Text style={[styles.workThoughtText, { color: colors.text }]}>“{quote.text}”</Text><Text style={[styles.workThoughtAuthor, { color: colors.muted }]}>— {quote.author}</Text></View>
    <TouchableOpacity onPress={() => router.push("/account")} style={styles.accountLink}><Text style={[styles.accountLinkText, { color: colors.muted }]}>Account & privacy →</Text></TouchableOpacity>
  </ScrollView><Modal transparent visible={pulseOpen} animationType="fade" onRequestClose={() => setPulseOpen(false)}><View style={styles.pulseBackdrop}><View style={[styles.pulseDialog, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.pulseEyebrow, { color: colors.teal }]}>BREAKROOM PULSE</Text><Text style={[styles.pulseTitle, { color: colors.text }]}>{pulseLoading ? "Checking the desk lights…" : `${onlineCount ?? 0} ${onlineCount === 1 ? "person is" : "people are"} online`}</Text><Text style={[styles.pulseCopy, { color: colors.muted }]}>This is a live total of connected Breakroom accounts. Names, locations, and profiles stay private.</Text><TouchableOpacity onPress={() => setPulseOpen(false)} style={[styles.pulseClose, { backgroundColor: colors.teal }]}><Text style={styles.pulseCloseText}>Back to desk</Text></TouchableOpacity></View></View></Modal></SafeAreaView>;
}

function DeskNotepad({ colors, quote }: { colors: any; quote: { text: string; author: string } }) {
  const motion = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(motion, { toValue: 1, duration: 3400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(motion, { toValue: 0, duration: 3400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    animation.start(); return () => animation.stop();
  }, [motion]);
  const rotate = motion.interpolate({ inputRange: [0, 1], outputRange: ["6deg", "12deg"] });
  const translate = motion.interpolate({ inputRange: [0, 1], outputRange: [0, 6] });
  return <Animated.View style={[styles.notepad, { transform: [{ translateX: translate }, { rotate }] }]}><Text style={styles.notepadLine}>WORK THOUGHT</Text><Text numberOfLines={3} style={styles.quoteText}>“{quote.text}”</Text><Text style={[styles.quoteAuthor, { color: colors.violet }]}>⌕ Read below</Text></Animated.View>;
}

function LiveLaptop() {
  const motion = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(motion, { toValue: 1, duration: 5200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(motion, { toValue: 0, duration: 5200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    animation.start(); return () => animation.stop();
  }, [motion]);
  const driftA = motion.interpolate({ inputRange: [0, 1], outputRange: [-10, 14] });
  const driftB = motion.interpolate({ inputRange: [0, 1], outputRange: [13, -10] });
  const glow = motion.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.92] });
  return <View style={styles.laptop}><View style={styles.laptopWallpaper}><Animated.View style={[styles.wallpaperOrbA, { transform: [{ translateX: driftA }], opacity: glow }]} /><Animated.View style={[styles.wallpaperOrbB, { transform: [{ translateX: driftB }], opacity: glow }]} /><Text style={styles.laptopScreen}>BREAKROOM</Text></View><View style={styles.laptopBase} /></View>;
}

function GoogleLoginButton() {
  const { loginWithGoogle } = useAuth();
  const { t } = useLanguage();

  if (Platform.OS === "web") {
    return <WebGoogleLoginButton label={t("continueGoogle")} loginWithGoogle={loginWithGoogle} />;
  }

  return <NativeGoogleLoginButton label={t("continueGoogle")} loginWithGoogle={loginWithGoogle} />;
}

function WebGoogleLoginButton({ label, loginWithGoogle }: { label: string; loginWithGoogle: (idToken: string) => Promise<void> }) {
  const redirectUri = AuthSession.makeRedirectUri({ path: "auth/google/callback" });
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    redirectUri,
  });

  useEffect(() => {
    if (response?.type === "success" && response.params.id_token) {
      loginWithGoogle(response.params.id_token).catch(() => Alert.alert("Sign-in failed", "Please try again."));
    }
  }, [response, loginWithGoogle]);

  return <TouchableOpacity disabled={!request} onPress={() => promptAsync()} style={styles.loginGoogleButton}><Text style={styles.loginGoogleText}>{label}</Text></TouchableOpacity>;
}

function NativeGoogleLoginButton({ label, loginWithGoogle }: { label: string; loginWithGoogle: (idToken: string) => Promise<void> }) {
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({ webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID });
  }, []);

  async function signIn() {
    try {
      setSigningIn(true);
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const result = await GoogleSignin.signIn();
      if (result.type === "cancelled") return;
      if (!result.data.idToken) throw new Error("Google did not return an ID token. Check the Web OAuth client ID.");
      await loginWithGoogle(result.data.idToken);
    } catch (error: any) {
      const nativeCode = error?.code;
      const apiStatus = error?.response?.status;
      console.error("Native Google sign-in failed", { nativeCode, apiStatus, message: error?.message });
      if (nativeCode === "DEVELOPER_ERROR" || nativeCode === "10") {
        Alert.alert("Google Android setup needed", "The Android OAuth client must use package com.boredapp.breakroom and the SHA-1 from the installed build. The Web client ID must remain in the app configuration.");
      } else if (apiStatus === 401 || apiStatus === 403) {
        Alert.alert("Sign-in was rejected", "Google completed sign-in, but the server rejected the token. Ensure Railway GOOGLE_WEB_CLIENT_ID matches the app’s Web OAuth client ID.");
      } else {
        Alert.alert("Sign-in failed", error?.message || "Google could not complete sign-in. Please try again.");
      }
    } finally {
      setSigningIn(false);
    }
  }

  return <TouchableOpacity disabled={signingIn} onPress={signIn} style={styles.loginGoogleButton}><Text style={styles.loginGoogleText}>{signingIn ? "Signing in..." : label}</Text></TouchableOpacity>;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },

  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },

  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 32,
  },
  gameSection: { marginTop: 16 }, gameSectionTitle: { fontSize: 18, fontWeight: "900" }, gameSectionCopy: { fontSize: 12, lineHeight: 18, marginTop: 3 }, gameRow: { flexDirection: "row", gap: 10, marginTop: 11 }, gameTile: { flex: 1, minHeight: 128, borderWidth: 1, borderRadius: 16, padding: 13 }, gameTileIcon: { fontSize: 23, fontWeight: "900" }, gameTileTitle: { fontSize: 14, fontWeight: "900", marginTop: 14 }, gameTileText: { fontSize: 11, lineHeight: 16, marginTop: 4 }, gameTileDarkTitle: { color: "#FFF", fontSize: 14, fontWeight: "900", marginTop: 14 }, gameTileDarkText: { color: "#DDEDE9", fontSize: 11, lineHeight: 16, marginTop: 4 }, focusedContent: { padding: 22, paddingTop: 32, paddingBottom: 36 }, focusedHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 }, focusedHeaderCopy: { flex: 1, minWidth: 0 }, focusedLogoutButton: { flexShrink: 0, paddingVertical: 4, paddingLeft: 4 }, focusedTitle: { fontSize: 27, fontWeight: "900" }, focusedSub: { fontSize: 14, lineHeight: 20, marginTop: 6, maxWidth: 270 }, deskScene: { borderRadius: 24, marginTop: 28, padding: 20, minHeight: 338, overflow: "hidden", position: "relative" }, window: { color: "#D8E9E5", fontSize: 24, textAlign: "right" }, laptop: { position: "absolute", left: 22, top: 68, width: 100, height: 62, backgroundColor: "#213034", borderWidth: 5, borderColor: "#52706E", borderRadius: 7, justifyContent: "center", alignItems: "center", zIndex: 2 }, laptopScreen: { color: "#A9D7D0", fontSize: 9, fontWeight: "900", letterSpacing: .7 }, deskLamp: { position: "absolute", left: 107, top: 143, height: 63, width: 48, zIndex: 4, alignItems: "center" }, lampGlow: { position: "absolute", top: 12, width: 52, height: 42, borderRadius: 26, backgroundColor: "rgba(248, 210, 117, .22)" }, lampShade: { width: 31, height: 17, marginTop: 4, backgroundColor: "#E7B957", borderTopLeftRadius: 20, borderTopRightRadius: 20, borderBottomLeftRadius: 5, borderBottomRightRadius: 5, borderWidth: 2, borderColor: "#7A5226" }, lampStem: { width: 4, height: 24, backgroundColor: "#7A5226" }, lampBase: { width: 30, height: 7, borderRadius: 6, backgroundColor: "#7A5226" }, pen: { position: "absolute", right: 118, top: 166, color: "#DAB36F", fontSize: 36, zIndex: 2 }, notepad: { position: "absolute", right: 22, top: 112, backgroundColor: "#F5E9D8", height: 79, width: 89, borderRadius: 4, zIndex: 2, padding: 8, shadowColor: "#101B1D", shadowOpacity: .25, shadowRadius: 4, elevation: 3 }, notepadLine: { color: "#8A654B", fontSize: 7, fontWeight: "900", letterSpacing: .25 }, quoteText: { color: "#49382D", fontSize: 8, lineHeight: 11, fontWeight: "700", marginTop: 5 }, quoteAuthor: { fontSize: 6, fontWeight: "900", marginTop: 4 }, photoFrame: { position: "absolute", left: 136, top: 176, height: 43, width: 36, backgroundColor: "#D7B27B", borderWidth: 4, borderColor: "#5C493A", alignItems: "center", justifyContent: "center", overflow: "hidden", zIndex: 2 }, photo: { fontSize: 18 }, photoImage: { width: "100%", height: "100%" }, photoPixelGrid: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(28, 45, 46, .12)", borderWidth: 1, borderColor: "rgba(255,255,255,.24)" }, deskTop: { height: 116, borderRadius: 10, marginTop: 173, opacity: .96 }, deskCaption: { fontSize: 13, marginTop: 13 }, sendPlaneButton: { padding: 14, borderRadius: 12, marginTop: 16, alignItems: "center" }, sendPlaneText: { fontWeight: "900" }, focusedGrid: { flexDirection: "row", gap: 12, marginTop: 14 }, focusedTile: { flex: 1, minHeight: 145, borderWidth: 1, borderRadius: 18, padding: 16 }, tileIcon: { fontSize: 21, fontWeight: "900" }, tileTitle: { fontSize: 16, fontWeight: "900", marginTop: 16 }, tileText: { fontSize: 12, lineHeight: 18, marginTop: 5 }, coffeeBreakCard: { borderWidth: 1, borderRadius: 18, padding: 15, marginTop: 15, flexDirection: "row", alignItems: "center", gap: 12 }, coffeeBreakIcon: { width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center" }, coffeeBreakIconText: { fontSize: 21 }, coffeeBreakCopy: { flex: 1 }, coffeeBreakEyebrow: { fontSize: 9, fontWeight: "900", letterSpacing: 1 }, coffeeBreakTitle: { fontSize: 15, fontWeight: "900", marginTop: 3 }, coffeeBreakText: { fontSize: 11, lineHeight: 16, marginTop: 3 }, coffeeBreakArrow: { fontSize: 21, fontWeight: "900" }, accountLink: { alignSelf: "center", padding: 18, marginTop: 14 }, accountLinkText: { fontWeight: "800", fontSize: 13 }, pulseBackdrop: { flex: 1, justifyContent: "center", padding: 22, backgroundColor: "rgba(16, 27, 29, .62)" }, pulseDialog: { flex: 1, justifyContent: "center", padding: 22, backgroundColor: "rgba(16, 27, 29, .62)" }, pulseEyebrow: { fontSize: 10, letterSpacing: 1.2, fontWeight: "900" }, pulseTitle: { fontSize: 25, lineHeight: 32, fontWeight: "900", marginTop: 8 }, pulseCopy: { fontSize: 13, lineHeight: 20, marginTop: 10 }, pulseClose: { minHeight: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 20 }, pulseCloseText: { color: "#FFF", fontSize: 14, fontWeight: "900" },

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F6F8",
  },

  loadingText: {
    marginTop: 12,
    color: "#777",
    fontSize: 15,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  brand: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.6,
    color: "#167C80",
    marginBottom: 16,
  },

  greeting: {
    fontSize: 15,
    color: "#667085",
  },

  username: {
    fontSize: 25,
    fontWeight: "800",
    color: "#172B4D",
    marginTop: 2,
  },

  profileBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#D9EEED",
    alignItems: "center",
    justifyContent: "center",
  },

  accountActions: { alignItems: "flex-end", gap: 7 },
  accountLinks: { flexDirection: "row", gap: 9 },
  logoutButton: { paddingHorizontal: 5, paddingVertical: 2 },
  logoutText: { color: Brand.colors.muted, fontSize: 12, fontWeight: "700" },

  profileInitial: {
    color: "#16676B",
    fontSize: 19,
    fontWeight: "800",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 34,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#E5F3EC",
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#289B66",
    marginRight: 7,
  },

  statusText: {
    color: "#267250",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.7,
  },

  heroCard: {
    backgroundColor: "#172B4D",
    borderRadius: 24,
    marginTop: 14,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 23,
    overflow: "hidden",
  },

  cardAccent: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "#23647A",
    opacity: 0.48,
    top: -96,
    right: -62,
  },

  eyebrow: {
    color: "#73D2CC",
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: "800",
  },

  title: {
    fontSize: 31,
    fontWeight: "800",
    color: "#FFFFFF",
    lineHeight: 38,
    marginTop: 13,
  },

  subtitle: {
    fontSize: 15,
    color: "#C7D2E4",
    marginTop: 13,
    lineHeight: 22,
  },

  primaryButton: {
    marginTop: 26,
    minHeight: 54,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: "#75D0C9",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },

  primaryButtonText: {
    color: "#123343",
    fontSize: 16,
    fontWeight: "800",
  },

  buttonArrow: {
    color: "#123343",
    fontSize: 25,
    fontWeight: "800",
  },

  infoRow: {
    flexDirection: "row",
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#E6EAF0",
  },

  infoIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#EEF3F7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  infoIconText: {
    color: "#344B6B",
    fontSize: 14,
    fontWeight: "800",
  },

  infoCopy: {
    flex: 1,
  },

  infoArrow: {
    color: Brand.colors.teal,
    fontSize: 21,
    fontWeight: "800",
    alignSelf: "center",
  },

  infoTitle: {
    color: "#1D2D44",
    fontSize: 15,
    fontWeight: "800",
  },

  infoText: {
    color: "#667085",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },

  footerText: {
    color: "#7A8596",
    textAlign: "center",
    fontSize: 12,
    marginTop: 22,
  },
  cultureCard: { marginTop: 16, padding: 18, borderRadius: Brand.radius.control, borderWidth: 1 },
  briefEyebrow: { color: Brand.colors.mint, fontSize: 10, fontWeight: "800", letterSpacing: 1.1 },
  briefTitle: { color: "#FFF", fontSize: 15, fontWeight: "800", marginTop: 7 },
  loginContainer: { flex: 1, justifyContent: "center", paddingHorizontal: 28, backgroundColor: Brand.colors.canvas },
  loginTitle: { color: Brand.colors.navy, fontSize: 34, lineHeight: 41, fontWeight: "800", marginTop: 20 },
  loginText: { color: Brand.colors.muted, fontSize: 16, lineHeight: 24, marginTop: 14 },
  loginGoogleButton: { marginTop: 32, minHeight: 56, alignItems: "center", justifyContent: "center", borderRadius: Brand.radius.control, backgroundColor: Brand.colors.navy },
  loginGoogleText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  laptopWallpaper: { flex: 1, alignSelf: "stretch", overflow: "hidden", backgroundColor: "#1E193F", justifyContent: "flex-end", padding: 7 },
  wallpaperOrbA: { position: "absolute", width: 76, height: 76, borderRadius: 38, backgroundColor: "#FE826B", top: -31, left: -14 },
  wallpaperOrbB: { position: "absolute", width: 92, height: 92, borderRadius: 46, backgroundColor: "#6856C8", right: -38, bottom: -43 },
  laptopBase: { position: "absolute", left: -10, right: -10, height: 7, bottom: -10, borderRadius: 6, backgroundColor: "#A9A8AC", borderWidth: 1, borderColor: "#D5D3D8" },
  waterBottle: { position: "absolute", right: 74, top: 174, width: 22, height: 56, borderRadius: 8, borderWidth: 2, borderColor: "#9AC8D4", backgroundColor: "#75BFD1", zIndex: 2, overflow: "visible" },
  bottleCap: { position: "absolute", width: 13, height: 7, backgroundColor: "#E5EEF0", borderRadius: 3, top: -8, left: 3 },
  bottleLabel: { position: "absolute", left: 1, right: 1, top: 23, height: 14, justifyContent: "center", alignItems: "center", backgroundColor: "#EAF8FA" },
  bottleLabelText: { color: "#37778B", fontSize: 6, fontWeight: "900" },
  headphones: { position: "absolute", right: 17, top: 189, width: 43, height: 34, zIndex: 2 },
  headphoneBand: { position: "absolute", width: 38, height: 30, left: 2, borderTopLeftRadius: 22, borderTopRightRadius: 22, borderWidth: 6, borderBottomWidth: 0, borderColor: "#36262B" },
  headphoneCup: { position: "absolute", bottom: 0, height: 15, width: 10, borderRadius: 5, backgroundColor: "#4B343A" },
  headphoneCupLeft: { left: 0 }, headphoneCupRight: { right: 0 },
  workThoughtCard: { borderWidth: 1, borderRadius: 16, padding: 16, marginTop: 14 },
  workThoughtLabel: { fontSize: 10, letterSpacing: 1.1, fontWeight: "900" },
  workThoughtText: { fontSize: 15, lineHeight: 22, fontWeight: "700", marginTop: 8 },
  workThoughtAuthor: { fontSize: 12, fontWeight: "800", marginTop: 8 },
  walletCard: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 14 },
  walletIcon: { height: 42, width: 42, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "#F5DD8C" },
  walletIconText: { color: "#6D4A06", fontSize: 20, fontWeight: "900" },
  walletCopy: { marginLeft: 12, flex: 1 }, walletEyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 1 }, walletBalance: { fontSize: 19, fontWeight: "900", marginTop: 2 }, walletHint: { fontSize: 11, marginTop: 2 },
});
