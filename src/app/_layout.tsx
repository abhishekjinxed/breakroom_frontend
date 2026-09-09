import { Stack, router, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform, View } from "react-native";
import * as Notifications from "expo-notifications";

import { connectSocket, disconnectSocket } from "../services/socket";

import { AuthProvider, useAuth } from "../context/AuthContext";
import { LanguageProvider } from "../context/LanguageContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { AppBottomNav } from "../components/AppBottomNav";
import { TermsGate } from "../components/TermsGate";
import { NotificationProvider } from "../context/NotificationContext";
import { notificationRoute } from "../services/push-notifications";

export default function RootLayout() {
  return (
    <ThemeProvider><LanguageProvider><AuthProvider><NotificationProvider><RootNavigator /></NotificationProvider></AuthProvider></LanguageProvider></ThemeProvider>
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
    if (Platform.OS === "web") return;
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      router.push(notificationRoute(response.notification) as never);
    });
    return () => subscription.remove();
  }, []);

  const hideNavigation = pathname.startsWith("/chat/") || pathname.startsWith("/auth/");

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
      {!!token && !hideNavigation && <AppBottomNav />}
      {!!user && !user.termsAcceptedAt && <TermsGate />}
    </View>
  );
}
