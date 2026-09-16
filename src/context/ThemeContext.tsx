import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { ColorSchemeName, useColorScheme } from "react-native";

const THEME_PREFERENCE_KEY = "breakroom_theme_preference";
export type ThemePreference = "system" | "light" | "dark";

const lightColors = {
  canvas: "#FFF6EA", surface: "#FFFCF7", surfaceSoft: "#F4E3CF", navy: "#2B252E", navyMuted: "#6F5B52", teal: "#47B7A7", tealSoft: "#DDF4EE", mint: "#F2B84B", green: "#3B8B6E", greenSoft: "#DFF2EA", violet: "#8F5A78", violetSoft: "#F3E4EE", amber: "#C9892E", amberSoft: "#FFF0C9", text: "#32241E", muted: "#806A5D", border: "#E8D3B7", danger: "#BF463D",
  onAccent: "#FFFFFF",
  hero: "#2B252E",
  heroAccent: "#5B3B31",
};

const darkColors = {
  canvas: "#1C1411", surface: "#2B252E", surfaceSoft: "#3A2C26", navy: "#FFF1E4", navyMuted: "#D5BAA5", teal: "#67D2C0", tealSoft: "#1E4F49", mint: "#F6C96A", green: "#9BD1A4", greenSoft: "#244534", violet: "#E0A6C7", violetSoft: "#563747", amber: "#F4C66D", amberSoft: "#5A431D", text: "#FFF6EA", muted: "#D1B9A7", border: "#543C33", danger: "#FF938A", onAccent: "#251810", hero: "#2B252E", heroAccent: "#5D3B32",
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
