import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { ColorSchemeName, useColorScheme } from "react-native";

const THEME_PREFERENCE_KEY = "breakroom_theme_preference";
export type ThemePreference = "system" | "light" | "dark";

const lightColors = {
  canvas: "#F7F0E7", surface: "#FFFDF9", surfaceSoft: "#F1E4D4", navy: "#3E281E", navyMuted: "#775F50", teal: "#9A5A32", tealSoft: "#F2DEC8", mint: "#E6B983", green: "#66835E", greenSoft: "#E2EBD9", violet: "#805E49", violetSoft: "#EDE0D5", amber: "#B87529", amberSoft: "#F8E5C8", text: "#34221A", muted: "#816C5E", border: "#E5D4C2", danger: "#B54D43",
  onAccent: "#FFFFFF",
  hero: "#293D78",
  heroAccent: "#645DC8",
};

const darkColors = {
  canvas: "#211711", surface: "#302119", surfaceSoft: "#402C21", navy: "#F9E9D7", navyMuted: "#D7BFA8", teal: "#E4A06B", tealSoft: "#523829", mint: "#F3C992", green: "#A7C291", greenSoft: "#30402B", violet: "#D5AB8B", violetSoft: "#53382B", amber: "#F2C372", amberSoft: "#543C21", text: "#FFF5E9", muted: "#D0BBA7", border: "#563D2F", danger: "#FF9F91", onAccent: "#3B2419", hero: "#4B2C20", heroAccent: "#81513B",
};

export type AppTheme = typeof lightColors;

type ThemeContextValue = {
  isDark: boolean;
  colors: AppTheme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  colors: lightColors,
  preference: "system",
  setPreference: async () => undefined,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme: ColorSchemeName = useColorScheme();
  const [preference, setCurrentPreference] = useState<ThemePreference>("system");

  useEffect(() => {
    AsyncStorage.getItem(THEME_PREFERENCE_KEY).then((saved) => {
      if (saved === "system" || saved === "light" || saved === "dark") setCurrentPreference(saved);
    });
  }, []);

  const isDark = preference === "dark" || (preference === "system" && systemScheme === "dark");
  const value = useMemo<ThemeContextValue>(() => ({
    isDark,
    colors: isDark ? darkColors : lightColors,
    preference,
    setPreference: async (nextPreference) => {
      setCurrentPreference(nextPreference);
      await AsyncStorage.setItem(THEME_PREFERENCE_KEY, nextPreference);
    },
  }), [isDark, preference]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
