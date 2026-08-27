
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
import { useEffect, useState } from "react";

WebBrowser.maybeCompleteAuthSession();
import { Brand } from "../constants/brand";

export default function HomeScreen() {
  const { user, loading, loginWithGoogle, logout } = useAuth();
  const { t } = useLanguage();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>{t("loading")}</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loginContainer}>
          <Text style={styles.brand}>BREAKROOM</Text>
          <Text style={styles.loginTitle}>{t("loginTitle")}</Text>
          <Text style={styles.loginText}>{t("loginText")}</Text>
          <GoogleLoginButton />
        </View>
      </SafeAreaView>
    );
  }

  function handleGettingBored() {
    router.push("/bored");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>BREAKROOM</Text>
            <Text style={styles.greeting}>{t("greeting")}</Text>
            <Text style={styles.username}>{user.anonymousUsername}</Text>
          </View>

          <View style={styles.accountActions}>
            <View style={styles.profileBadge}>
              <Text style={styles.profileInitial}>
                {user.anonymousUsername.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.accountLinks}><TouchableOpacity onPress={() => router.push("/account")}><Text style={styles.logoutText}>{t("account")}</Text></TouchableOpacity><TouchableOpacity onPress={logout}><Text style={styles.logoutText}>{t("signOut")}</Text></TouchableOpacity></View>
          </View>
        </View>

        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{t("available")}</Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.cardAccent} />
          <Text style={styles.eyebrow}>{t("heroEyebrow")}</Text>
          <Text style={styles.title}>{t("heroTitle")}</Text>
          <Text style={styles.subtitle}>{t("heroText")}</Text>

          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.88}
            onPress={handleGettingBored}
          >
            <Text style={styles.primaryButtonText}>{t("findPartner")}</Text>
            <Text style={styles.buttonArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.infoRow}
          activeOpacity={0.85}
          onPress={() => router.push("/office-pulse")}
        >
          <View style={styles.infoIcon}>
            <Text style={styles.infoIconText}>15</Text>
          </View>
          <View style={styles.infoCopy}>
            <Text style={styles.infoTitle}>{t("officePulse")}</Text>
            <Text style={styles.infoText}>{t("officePulseText")}</Text>
          </View>
          <Text style={styles.infoArrow}>→</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>{t("communitySafety")}</Text>
        <TouchableOpacity style={styles.briefCard} onPress={() => router.push("/break-briefs")}>
          <Text style={styles.briefEyebrow}>{t("breakBriefs")}</Text>
          <Text style={styles.briefTitle}>{t("breakBriefsText")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
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
      if (result.type === "success" && result.data.idToken) await loginWithGoogle(result.data.idToken);
    } catch {
      Alert.alert("Sign-in failed", "Google could not complete sign-in. Please try again.");
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
  briefCard: { marginTop: 16, padding: 18, backgroundColor: Brand.colors.navy, borderRadius: Brand.radius.control },
  briefEyebrow: { color: Brand.colors.mint, fontSize: 10, fontWeight: "800", letterSpacing: 1.1 },
  briefTitle: { color: "#FFF", fontSize: 15, fontWeight: "800", marginTop: 7 },
  loginContainer: { flex: 1, justifyContent: "center", paddingHorizontal: 28, backgroundColor: Brand.colors.canvas },
  loginTitle: { color: Brand.colors.navy, fontSize: 34, lineHeight: 41, fontWeight: "800", marginTop: 20 },
  loginText: { color: Brand.colors.muted, fontSize: 16, lineHeight: 24, marginTop: 14 },
  loginGoogleButton: { marginTop: 32, minHeight: 56, alignItems: "center", justifyContent: "center", borderRadius: Brand.radius.control, backgroundColor: Brand.colors.navy },
  loginGoogleText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
});
