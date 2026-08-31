
import {
  ActivityIndicator,
  Alert,
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
import { getDeskQuote } from "../api/desk";

export default function HomeScreen() {
  const { user, loading, loginWithGoogle, logout } = useAuth();
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

  return <FocusedHome username={user.anonymousUsername} colors={colors} onLogout={logout} />;

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

        <TouchableOpacity
          style={[styles.infoRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
          activeOpacity={0.85}
          onPress={() => router.push("/office-pulse")}
        >
          <View style={[styles.infoIcon, { backgroundColor: colors.amberSoft }]}>
            <Text style={[styles.infoIconText, { color: colors.amber }]}>P</Text>
          </View>
          <View style={styles.infoCopy}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>{t("officePulse")}</Text>
            <Text style={[styles.infoText, { color: colors.muted }]}>{t("officePulseText")}</Text>
          </View>
          <Text style={[styles.infoArrow, { color: colors.teal }]}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.cultureCard, { backgroundColor: colors.violetSoft, borderColor: colors.violet }]} onPress={() => router.push("/culture-hub" as any)}>
          <Text style={[styles.briefEyebrow, { color: colors.violet }]}>CULTURE HUB</Text>
          <Text style={[styles.briefTitle, { color: colors.navy }]}>Coffee Pairing, desk prompts, appreciation, and more →</Text>
        </TouchableOpacity>
        <Text style={[styles.footerText, { color: colors.muted }]}>{t("communitySafety")}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function FocusedHome({ username, colors, onLogout }: { username: string; colors: any; onLogout: () => Promise<void> }) {
  return <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.canvas }]}><ScrollView contentContainerStyle={styles.focusedContent}>
    <View style={styles.focusedHeader}><View><Text style={[styles.brand, { color: colors.teal }]}>BREAKROOM</Text><Text style={[styles.focusedTitle, { color: colors.navy }]}>Your desk, {username}</Text><Text style={[styles.focusedSub, { color: colors.muted }]}>Paper Planes land here when someone wants to connect.</Text></View><TouchableOpacity onPress={onLogout}><Text style={[styles.logoutText, { color: colors.muted }]}>Sign out</Text></TouchableOpacity></View>
    <View style={[styles.deskScene, { backgroundColor: colors.hero }]}><Text style={styles.window}>☕     ▣</Text><View style={styles.laptop}><Text style={styles.laptopScreen}>BREAKROOM</Text></View><Text style={styles.pen}>╱</Text><DeskNotepad colors={colors} /><View style={styles.photoFrame}><Text style={styles.photo}>☕</Text></View><View style={[styles.deskTop, { backgroundColor: colors.mint }]} /><DeskPlanes /><Text style={styles.deskCaption}>Tap a landed Paper Plane to read it.</Text><TouchableOpacity onPress={() => router.push("/bored" as any)} style={[styles.sendPlaneButton, { backgroundColor: colors.mint }]}><Text style={[styles.sendPlaneText, { color: colors.onAccent }]}>Send a Paper Plane</Text></TouchableOpacity></View>
    <DeskNotesTicker />
    <TouchableOpacity onPress={() => router.push("/account")} style={styles.accountLink}><Text style={[styles.accountLinkText, { color: colors.muted }]}>Account & privacy →</Text></TouchableOpacity>
  </ScrollView></SafeAreaView>;
}

function DeskNotepad({ colors }: { colors: any }) {
  const motion = useRef(new Animated.Value(0)).current;
  const [quote, setQuote] = useState({ text: "Small progress is still progress.", author: "Breakroom" });
  useEffect(() => { getDeskQuote().then(setQuote).catch(() => undefined); }, []);
  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(motion, { toValue: 1, duration: 3400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(motion, { toValue: 0, duration: 3400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    animation.start(); return () => animation.stop();
  }, [motion]);
  const rotate = motion.interpolate({ inputRange: [0, 1], outputRange: ["6deg", "12deg"] });
  const translate = motion.interpolate({ inputRange: [0, 1], outputRange: [0, 6] });
  return <Animated.View style={[styles.notepad, { transform: [{ translateX: translate }, { rotate }] }]}><Text style={styles.notepadLine}>WORK THOUGHT</Text><Text numberOfLines={3} style={styles.quoteText}>“{quote.text}”</Text><Text numberOfLines={1} style={[styles.quoteAuthor, { color: colors.violet }]}>— {quote.author}</Text></Animated.View>;
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
  focusedContent: { padding: 22, paddingTop: 32, paddingBottom: 36 }, focusedHeader: { flexDirection: "row", justifyContent: "space-between", gap: 14 }, focusedTitle: { fontSize: 27, fontWeight: "900" }, focusedSub: { fontSize: 14, lineHeight: 20, marginTop: 6, maxWidth: 270 }, deskScene: { borderRadius: 24, marginTop: 28, padding: 20, minHeight: 338, overflow: "hidden", position: "relative" }, window: { color: "#FFE7C4", fontSize: 24, textAlign: "right" }, laptop: { position: "absolute", left: 22, top: 68, width: 100, height: 62, backgroundColor: "#3B2B25", borderWidth: 5, borderColor: "#5D4338", borderRadius: 7, justifyContent: "center", alignItems: "center", zIndex: 2 }, laptopScreen: { color: "#D7B381", fontSize: 9, fontWeight: "900", letterSpacing: .7 }, pen: { position: "absolute", right: 91, top: 166, color: "#FFD269", fontSize: 36, zIndex: 2 }, notepad: { position: "absolute", right: 22, top: 112, backgroundColor: "#F8E7CC", height: 79, width: 89, borderRadius: 4, zIndex: 2, padding: 8, shadowColor: "#1C0D08", shadowOpacity: .25, shadowRadius: 4, elevation: 3 }, notepadLine: { color: "#9A7053", fontSize: 7, fontWeight: "900", letterSpacing: .25 }, quoteText: { color: "#523A2C", fontSize: 8, lineHeight: 11, fontWeight: "700", marginTop: 5 }, quoteAuthor: { fontSize: 6, fontWeight: "900", marginTop: 4 }, photoFrame: { position: "absolute", left: 136, top: 176, height: 43, width: 36, backgroundColor: "#E7C190", borderWidth: 4, borderColor: "#684635", alignItems: "center", justifyContent: "center", zIndex: 2 }, photo: { fontSize: 18 }, deskTop: { height: 116, borderRadius: 10, marginTop: 173, opacity: .9 }, deskCaption: { color: "#F5D9BB", fontSize: 13, marginTop: 13 }, sendPlaneButton: { padding: 14, borderRadius: 12, marginTop: 16, alignItems: "center" }, sendPlaneText: { fontWeight: "900" }, focusedGrid: { flexDirection: "row", gap: 12, marginTop: 14 }, focusedTile: { flex: 1, minHeight: 145, borderWidth: 1, borderRadius: 18, padding: 16 }, tileIcon: { fontSize: 21, fontWeight: "900" }, tileTitle: { fontSize: 16, fontWeight: "900", marginTop: 16 }, tileText: { fontSize: 12, lineHeight: 18, marginTop: 5 }, accountLink: { alignSelf: "center", padding: 18, marginTop: 14 }, accountLinkText: { fontWeight: "800", fontSize: 13 },

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
});
