import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { ColorSchemeName, useColorScheme } from "react-native";

const THEME_PREFERENCE_KEY = "breakroom_theme_preference";
export type ThemePreference = "system" | "light" | "dark";

const lightColors = {
  canvas: "#F4F1EB", surface: "#FFFDFC", surfaceSoft: "#ECE7DE", navy: "#26363A", navyMuted: "#657276", teal: "#2C8B83", tealSoft: "#DCEFEA", mint: "#C89155", green: "#4E8A70", greenSoft: "#DDEEE4", violet: "#8C6378", violetSoft: "#F0E5EA", amber: "#B87836", amberSoft: "#F7E7CB", text: "#263035", muted: "#697477", border: "#DDD5C9", danger: "#B84942",
  onAccent: "#FFFFFF",
  hero: "#2B393B",
  heroAccent: "#A97950",
};

const darkColors = {
  canvas: "#172325", surface: "#223236", surfaceSoft: "#2C3B3E", navy: "#F4F0E8", navyMuted: "#C5D0CE", teal: "#76D0C4", tealSoft: "#1F514D", mint: "#D5A46A", green: "#A0D0AF", greenSoft: "#244C3B", violet: "#D9A9C2", violetSoft: "#553C4A", amber: "#E3B36E", amberSoft: "#59482B", text: "#F4F0E8", muted: "#B9C4C2", border: "#3E5354", danger: "#FF9A90", onAccent: "#162527", hero: "#1D2B2E", heroAccent: "#79573D",
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
