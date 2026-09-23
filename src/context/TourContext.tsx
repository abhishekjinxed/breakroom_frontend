import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAuth } from "./AuthContext";
import { useTheme } from "./ThemeContext";

type TourContextValue = { restartTour: () => Promise<void> };

const TourContext = createContext<TourContextValue | undefined>(undefined);

const steps = [
  { icon: "☕", eyebrow: "WELCOME TO BREAKROOM", title: "Your quiet desk at work.", body: "Breakroom is a calm space to meet people, take short breaks, and share small workday moments." },
  { icon: "✈", eyebrow: "YOUR DESK", title: "Paper Planes start conversations.", body: "Write a short note and send a Paper Plane. A plane can land on someone’s desk for up to 24 hours. When they accept it, the chat moves to Inbox." },
  { icon: "▤", eyebrow: "DESK NOTES", title: "Share a small public thought.", body: "Pin a Desk Note for the community. People can applaud or comment. You can manage or remove your notes anytime from Account." },
  { icon: "⊞", eyebrow: "GAME TABLE", title: "Take a small screen break.", body: "Open the Game Table for a quick Tic-Tac-Toe match or a solo Tetris break." },
  { icon: "✓", eyebrow: "YOU’RE READY", title: "Keep it kind and in your control.", body: "Use Inbox for accepted conversations, customise your profile in Account, and block or report anything that does not belong here." },
];

function storageKey(userId: string) {
  return `breakroom_tour_seen:${userId}`;
}

export function AppTourProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [step, setStep] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    setStep(null);
    if (!user?.id || !user.termsAcceptedAt) return;

    AsyncStorage.getItem(storageKey(user.id)).then((seen) => {
      if (active && !seen) setStep(0);
    }).catch(() => {
      if (active) setStep(0);
    });

    return () => { active = false; };
  }, [user?.id, user?.termsAcceptedAt]);

  const finish = async () => {
    if (user?.id) await AsyncStorage.setItem(storageKey(user.id), "true");
    setStep(null);
  };

  const restartTour = async () => {
    if (!user?.id) return;
    await AsyncStorage.removeItem(storageKey(user.id));
    setStep(0);
  };

  const value = useMemo(() => ({ restartTour }), [user?.id]);
  const current = step === null ? null : steps[step];

  return <TourContext.Provider value={value}>{children}
    <Modal transparent visible={!!current} animationType="fade" statusBarTranslucent onRequestClose={finish}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.stepCount, { color: colors.muted }]}>STEP {(step ?? 0) + 1} OF {steps.length}</Text>
          <View style={[styles.icon, { backgroundColor: colors.tealSoft }]}><Text style={[styles.iconText, { color: colors.teal }]}>{current?.icon}</Text></View>
          <Text style={[styles.eyebrow, { color: colors.teal }]}>{current?.eyebrow}</Text>
          <Text style={[styles.title, { color: colors.text }]}>{current?.title}</Text>
          <Text style={[styles.body, { color: colors.muted }]}>{current?.body}</Text>
          <View style={styles.dots}>{steps.map((_, index) => <View key={index} style={[styles.dot, { backgroundColor: index === step ? colors.teal : colors.border }]} />)}</View>
          <View style={styles.actions}>
            <TouchableOpacity accessibilityRole="button" onPress={finish} style={styles.skip}><Text style={[styles.skipText, { color: colors.muted }]}>Skip tour</Text></TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" onPress={() => step === steps.length - 1 ? finish() : setStep((currentStep) => (currentStep ?? 0) + 1)} style={[styles.next, { backgroundColor: colors.teal }]}>
              <Text style={styles.nextText}>{step === steps.length - 1 ? "Start exploring" : "Next"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  </TourContext.Provider>;
}

export function useAppTour() {
  const context = useContext(TourContext);
  if (!context) throw new Error("useAppTour must be used inside AppTourProvider");
  return context;
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "center", padding: 22, backgroundColor: "rgba(27, 20, 17, .72)" },
  card: { borderRadius: 24, borderWidth: 1, padding: 24, maxWidth: 460, width: "100%", alignSelf: "center" },
  stepCount: { fontSize: 10, fontWeight: "900", letterSpacing: 1.2, textAlign: "right" },
  icon: { width: 58, height: 58, borderRadius: 18, alignItems: "center", justifyContent: "center", marginTop: 8 },
  iconText: { fontSize: 28 },
  eyebrow: { fontSize: 10, letterSpacing: 1.3, fontWeight: "900", marginTop: 22 },
  title: { fontSize: 27, lineHeight: 33, fontWeight: "900", marginTop: 7 },
  body: { fontSize: 15, lineHeight: 23, marginTop: 12 },
  dots: { flexDirection: "row", gap: 6, marginTop: 24 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  actions: { flexDirection: "row", gap: 10, marginTop: 24 },
  skip: { minHeight: 48, paddingHorizontal: 14, alignItems: "center", justifyContent: "center" },
  skipText: { fontSize: 13, fontWeight: "800" },
  next: { flex: 1, minHeight: 50, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  nextText: { color: "#FFF", fontSize: 15, fontWeight: "900" },
});
