import { useMemo, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { DateTimePicker } from "@expo/ui/community/datetime-picker";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const EARLIEST_DATE = new Date(1900, 0, 1);

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

function adultCutoffDate() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setFullYear(date.getFullYear() - 18);
  return date;
}

export function DateOfBirthGate() {
  const { user, updateProfile, logout } = useAuth();
  const { colors } = useTheme();
  const [value, setValue] = useState(user?.dateOfBirth?.slice(0, 10) ?? "");
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latestAllowedDate = useMemo(adultCutoffDate, []);
  const selectedDate = parseDate(value) ?? latestAllowedDate;

  async function save() {
    const date = parseDate(value);
    if (!date) {
      setError("Choose your date of birth to continue.");
      return;
    }
    if (date > latestAllowedDate) {
      setError("Breakroom is available only to people aged 18 and over.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await updateProfile({
        publicAvatarUrl: user?.publicAvatarUrl ?? null,
        publicFlair: user?.publicFlair ?? null,
        bio: user?.bio ?? null,
        dateOfBirth: value,
        gender: user?.gender ?? null,
        socialLink: user?.socialLink ?? null,
      });
    } catch {
      setError("We could not save your date of birth. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={[styles.backdrop, { backgroundColor: colors.canvas }]}> 
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
        <Text style={[styles.eyebrow, { color: colors.teal }]}>ONE QUICK STEP</Text>
        <Text style={[styles.title, { color: colors.text }]}>Confirm your age</Text>
        <Text style={[styles.copy, { color: colors.muted }]}>Breakroom is for adults aged 18 and over. Your birth date stays private and is never shown on your profile.</Text>

        <Text style={[styles.label, { color: colors.text }]}>Date of birth</Text>
        {Platform.OS === "web" ? (
          <TextInput
            accessibilityLabel="Date of birth"
            value={value}
            onChangeText={(text) => { setValue(text); setError(null); }}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.muted}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
            style={[styles.dateField, { color: colors.text, borderColor: colors.border, backgroundColor: colors.canvas }]}
          />
        ) : (
          <>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Choose your date of birth"
              onPress={() => setShowPicker(true)}
              style={[styles.dateField, styles.dateButton, { borderColor: colors.border, backgroundColor: colors.canvas }]}
            >
              <Text style={[styles.dateText, { color: value ? colors.text : colors.muted }]}>{value || "Choose date"}</Text>
              <Text style={[styles.calendarIcon, { color: colors.teal }]}>▣</Text>
            </TouchableOpacity>
            {showPicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                maximumDate={latestAllowedDate}
                minimumDate={EARLIEST_DATE}
                presentation="dialog"
                positiveButton={{ label: "Use date" }}
                negativeButton={{ label: "Cancel" }}
                accentColor={colors.teal}
                onValueChange={(_event, date) => { setValue(formatDate(date)); setError(null); setShowPicker(false); }}
                onDismiss={() => setShowPicker(false)}
              />
            )}
          </>
        )}
        {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}

        <TouchableOpacity accessibilityRole="button" disabled={saving} onPress={save} style={[styles.continueButton, { backgroundColor: colors.teal }, saving && styles.disabled]}>
          {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.continueText}>Continue to Breakroom</Text>}
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" disabled={saving} onPress={logout} style={styles.signOut}>
          <Text style={[styles.signOutText, { color: colors.muted }]}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, zIndex: 100, alignItems: "center", justifyContent: "center", padding: 22 },
  card: { width: "100%", maxWidth: 480, borderWidth: 1, borderRadius: 22, padding: 24 },
  eyebrow: { fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  title: { marginTop: 8, fontSize: 27, fontWeight: "900" },
  copy: { marginTop: 10, fontSize: 15, lineHeight: 22 },
  label: { marginTop: 23, marginBottom: 8, fontSize: 13, fontWeight: "800" },
  dateField: { minHeight: 54, borderWidth: 1, borderRadius: 13, paddingHorizontal: 15, fontSize: 16, justifyContent: "center" },
  dateButton: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dateText: { fontSize: 16, fontWeight: "700" },
  calendarIcon: { fontSize: 21, fontWeight: "900" },
  error: { marginTop: 10, color: "#B42318", fontSize: 13, fontWeight: "700", lineHeight: 18 },
  continueButton: { minHeight: 54, borderRadius: 13, marginTop: 22, alignItems: "center", justifyContent: "center" },
  continueText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
  disabled: { opacity: 0.65 },
  signOut: { alignItems: "center", paddingTop: 18, paddingBottom: 2 },
  signOutText: { fontSize: 13, fontWeight: "800" },
});
