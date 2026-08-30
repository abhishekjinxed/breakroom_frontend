import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";

import { connectSocket, disconnectSocket } from "../services/socket";

import { AuthProvider, useAuth } from "../context/AuthContext";
import { LanguageProvider } from "../context/LanguageContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { AppBottomNav } from "../components/AppBottomNav";
import { TermsGate } from "../components/TermsGate";
import { PaperPlaneInbox } from "../components/PaperPlaneInbox";

export default function RootLayout() {
  return (
    <ThemeProvider><LanguageProvider><AuthProvider><RootNavigator /></AuthProvider></LanguageProvider></ThemeProvider>
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

  const hideNavigation = pathname.startsWith("/chat/") || pathname.startsWith("/auth/");

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
      {!!token && !hideNavigation && <AppBottomNav />}
      {!!token && <PaperPlaneInbox />}
      {!!user && !user.termsAcceptedAt && <TermsGate />}
    </View>
  );
}
