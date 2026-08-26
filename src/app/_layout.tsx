import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";

import { connectSocket, disconnectSocket } from "../services/socket";

import { AuthProvider, useAuth } from "../context/AuthContext";
import { AppBottomNav } from "../components/AppBottomNav";

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

function RootNavigator() {
  const { token } = useAuth();
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
    </View>
  );
}
