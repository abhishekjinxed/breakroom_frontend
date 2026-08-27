import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Brand } from "../constants/brand";
import { useAuth } from "../context/AuthContext";

export function TermsGate() {
  const { acceptTerms } = useAuth();
  const [saving, setSaving] = useState(false);
  async function continueToApp() { setSaving(true); try { await acceptTerms(); } finally { setSaving(false); } }
  return <View style={styles.backdrop}><View style={styles.card}><Text style={styles.eyebrow}>COMMUNITY AGREEMENT</Text><Text style={styles.title}>A respectful workplace, by design.</Text><Text style={styles.copy}>By continuing, you agree to use Breakroom professionally, avoid harmful or offensive content, and respect other members. Posts, videos, comments, and conversations can be reported and reviewed.</Text><View style={styles.links}><TouchableOpacity onPress={() => router.push("/terms")}><Text style={styles.link}>Terms of Use</Text></TouchableOpacity><TouchableOpacity onPress={() => router.push("/privacy")}><Text style={styles.link}>Privacy Policy</Text></TouchableOpacity></View><TouchableOpacity disabled={saving} style={styles.button} onPress={continueToApp}>{saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>I agree and continue</Text>}</TouchableOpacity></View></View>;
}
const styles = StyleSheet.create({ backdrop: { ...StyleSheet.absoluteFill, zIndex: 30, backgroundColor: "rgba(23,43,77,0.72)", alignItems: "center", justifyContent: "center", padding: 22 }, card: { backgroundColor: "#FFF", borderRadius: 22, padding: 24, maxWidth: 480 }, eyebrow: { color: Brand.colors.teal, fontSize: 10, letterSpacing: 1.2, fontWeight: "800" }, title: { color: Brand.colors.navy, fontSize: 25, lineHeight: 31, fontWeight: "800", marginTop: 10 }, copy: { color: Brand.colors.muted, fontSize: 14, lineHeight: 21, marginTop: 12 }, links: { flexDirection: "row", gap: 18, marginTop: 18 }, link: { color: Brand.colors.teal, fontSize: 13, fontWeight: "800" }, button: { marginTop: 22, minHeight: 50, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: Brand.colors.navy }, buttonText: { color: "#FFF", fontSize: 15, fontWeight: "800" } });
