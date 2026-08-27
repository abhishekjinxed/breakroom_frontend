import { createContext, ReactNode, useContext } from "react";
import { ColorSchemeName, useColorScheme } from "react-native";

const lightColors = {
  canvas: "#F5F7FA",
  surface: "#FFFFFF",
  surfaceSoft: "#EEF3F7",
  navy: "#17324D",
  navyMuted: "#47627C",
  teal: "#147A78",
  tealSoft: "#DCEFED",
  mint: "#8CDED3",
  green: "#168A5B",
  greenSoft: "#E2F4EC",
  text: "#172B3A",
  muted: "#64748B",
  border: "#DCE4EC",
  danger: "#C2413B",
  onAccent: "#FFFFFF",
  hero: "#193650",
  heroAccent: "#2F7081",
};

const darkColors = {
  canvas: "#0D1720",
  surface: "#14222E",
  surfaceSoft: "#1B2D3A",
  navy: "#DCEAF3",
  navyMuted: "#A7BCCB",
  teal: "#72D5CC",
  tealSoft: "#1A393D",
  mint: "#9AE6DC",
  green: "#78D9A7",
  greenSoft: "#15362D",
  text: "#ECF4F8",
  muted: "#9DB0BF",
  border: "#29404F",
  danger: "#FF9B93",
  onAccent: "#10212B",
  hero: "#183C4B",
  heroAccent: "#2F7280",
};

export type AppTheme = typeof lightColors;

const ThemeContext = createContext<{ isDark: boolean; colors: AppTheme }>({ isDark: false, colors: lightColors });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme: ColorSchemeName = useColorScheme();
  const isDark = systemScheme === "dark";
  return <ThemeContext.Provider value={{ isDark, colors: isDark ? darkColors : lightColors }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
