import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";

import { connectSocket, disconnectSocket } from "../services/socket";

import { AuthProvider, useAuth } from "../context/AuthContext";
import { LanguageProvider } from "../context/LanguageContext";
import { AppBottomNav } from "../components/AppBottomNav";
import { TermsGate } from "../components/TermsGate";

export default function RootLayout() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </LanguageProvider>
  );
}

function RootNavigator() {
  const { token, user } = useAuth();
  const pathname = usePathname();

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

  const hideNavigation = pathname.startsWith("/chat/") || pathname.startsWith("/auth/") || pathname === "/bored";

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />

      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
      {!!token && !hideNavigation && <AppBottomNav />}
      {!!user && !user.termsAcceptedAt && <TermsGate />}
    </View>
  );
}
