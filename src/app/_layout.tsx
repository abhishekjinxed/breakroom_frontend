import { Stack, router, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AppState, Platform, View } from "react-native";
import * as Notifications from "expo-notifications";

import { connectSocket, disconnectSocket, setSocketAppForeground } from "../services/socket";

import { AuthProvider, useAuth } from "../context/AuthContext";
import { LanguageProvider } from "../context/LanguageContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { AppBottomNav } from "../components/AppBottomNav";
import { TermsGate } from "../components/TermsGate";
import { DateOfBirthGate } from "../components/DateOfBirthGate";
import { NotificationProvider } from "../context/NotificationContext";
import { notificationRoute } from "../services/push-notifications";
import { AppTourProvider } from "../context/TourContext";

export default function RootLayout() {
  return (
    <ThemeProvider><LanguageProvider><AuthProvider><AppTourProvider><NotificationProvider><RootNavigator /></NotificationProvider></AppTourProvider></AuthProvider></LanguageProvider></ThemeProvider>
  );
}

function RootNavigator() {
  const { token, user } = useAuth();
  const pathname = usePathname();
  const { isDark } = useTheme();

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      return;
    }

    console.log("🔌 Connecting Socket.IO...");

    connectSocket(token);

    return () => {
      // Don't disconnect here if your
      // AuthContext remains mounted during
      // navigation.
    };
  }, [token]);

  useEffect(() => {
    if (!token) return;
    if (Platform.OS === "web") {
      const updateBrowserPresence = () => {
        setSocketAppForeground(document.visibilityState === "visible" && document.hasFocus());
      };
      updateBrowserPresence();
      document.addEventListener("visibilitychange", updateBrowserPresence);
      window.addEventListener("focus", updateBrowserPresence);
      window.addEventListener("blur", updateBrowserPresence);
      return () => {
        document.removeEventListener("visibilitychange", updateBrowserPresence);
        window.removeEventListener("focus", updateBrowserPresence);
        window.removeEventListener("blur", updateBrowserPresence);
      };
    }

    const updateAppPresence = (state: string) => setSocketAppForeground(state === "active");
    const onAppFocus = () => setSocketAppForeground(true);
    const onAppBlur = () => setSocketAppForeground(false);
    updateAppPresence(AppState.currentState);
    const stateSubscription = AppState.addEventListener("change", updateAppPresence);
    const focusSubscription = Platform.OS === "android" ? AppState.addEventListener("focus", onAppFocus) : null;
    const blurSubscription = Platform.OS === "android" ? AppState.addEventListener("blur", onAppBlur) : null;
    return () => {
      stateSubscription.remove();
      focusSubscription?.remove();
      blurSubscription?.remove();
    };
  }, [token]);

  useEffect(() => {
    if (Platform.OS === "web") return;
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      router.push(notificationRoute(response.notification) as never);
    });
    return () => subscription.remove();
  }, []);

  const needsDateOfBirth = !!user && !user.dateOfBirth;
  const hideNavigation = pathname.startsWith("/chat/") || pathname.startsWith("/auth/") || needsDateOfBirth;

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
      {!!token && !hideNavigation && <AppBottomNav />}
      {!!user && !user.termsAcceptedAt && !needsDateOfBirth && <TermsGate />}
      {needsDateOfBirth && <DateOfBirthGate />}
    </View>
  );
}
