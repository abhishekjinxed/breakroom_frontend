import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { ColorSchemeName, useColorScheme } from "react-native";

const THEME_PREFERENCE_KEY = "breakroom_theme_preference";
export type ThemePreference = "system" | "light" | "dark";

const lightColors = {
  canvas: "#F7F7FC",
  surface: "#FFFFFF",
  surfaceSoft: "#EEF3FF",
  navy: "#243A73",
  navyMuted: "#536B91",
  teal: "#078C88",
  tealSoft: "#DCF7F1",
  mint: "#78E0CE",
  green: "#159A67",
  greenSoft: "#E0F6EB",
  violet: "#6956C8",
  violetSoft: "#EEEAFE",
  amber: "#C67B18",
  amberSoft: "#FFF1D6",
  text: "#1B2944",
  muted: "#64738D",
  border: "#DBE2F0",
  danger: "#C94750",
  onAccent: "#FFFFFF",
  hero: "#293D78",
  heroAccent: "#645DC8",
};

const darkColors = {
  canvas: "#101426",
  surface: "#191F38",
  surfaceSoft: "#202944",
  navy: "#E6EAFF",
  navyMuted: "#B4C0DF",
  teal: "#66DCCE",
  tealSoft: "#173D42",
  mint: "#9AE7D8",
  green: "#7CDEAB",
  greenSoft: "#183C31",
  violet: "#BBAEFA",
  violetSoft: "#30295B",
  amber: "#FFD084",
  amberSoft: "#4A3920",
  text: "#F0F3FF",
  muted: "#AAB6D2",
  border: "#303A5A",
  danger: "#FF9FA6",
  onAccent: "#142032",
  hero: "#2C3470",
  heroAccent: "#685FD0",
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
