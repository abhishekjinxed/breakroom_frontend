import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { Brand } from "../constants/brand";

const principles = [
  ["01", "Take a pause", "A short change of pace can make the next stretch of work feel lighter."],
  ["02", "Keep it human", "You’re speaking with another professional, not performing for a profile."],
  ["03", "Leave refreshed", "End the conversation whenever you are ready and return to your day."],
];

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.brand}>BREAKROOM</Text>
        <Text style={styles.eyebrow}>HOW IT WORKS</Text>
        <Text style={styles.title}>A pause with purpose.</Text>
        <Text style={styles.subtitle}>
          Breakroom makes it easy to take a brief, anonymous reset during a busy workday.
        </Text>

        <View style={styles.principles}>
          {principles.map(([number, title, description]) => (
            <View key={number} style={styles.principle}>
              <Text style={styles.number}>{number}</Text>
              <View style={styles.principleCopy}>
                <Text style={styles.principleTitle}>{title}</Text>
                <Text style={styles.principleText}>{description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.privacyCard}>
          <View style={styles.privacyDot} />
          <View style={styles.privacyCopy}>
            <Text style={styles.privacyTitle}>Built for privacy</Text>
            <Text style={styles.privacyText}>No personal profiles. Leave a chat whenever you want.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Brand.colors.canvas },
  content: { paddingHorizontal: 22, paddingTop: 32, paddingBottom: 36 },
  brand: { color: Brand.colors.teal, fontSize: 11, fontWeight: "800", letterSpacing: 1.6 },
  eyebrow: { color: Brand.colors.teal, fontSize: 10, fontWeight: "800", letterSpacing: 1.2, marginTop: 48 },
  title: { color: Brand.colors.navy, fontSize: 32, fontWeight: "800", lineHeight: 39, marginTop: 10 },
  subtitle: { color: Brand.colors.muted, fontSize: 16, lineHeight: 24, marginTop: 13, maxWidth: 350 },
  principles: { marginTop: 34, backgroundColor: Brand.colors.surface, borderRadius: Brand.radius.card, borderWidth: 1, borderColor: Brand.colors.border },
  principle: { flexDirection: "row", padding: 20, borderBottomWidth: 1, borderBottomColor: Brand.colors.border },
  number: { color: Brand.colors.teal, fontSize: 12, fontWeight: "800", letterSpacing: 0.6, width: 39, paddingTop: 2 },
  principleCopy: { flex: 1 }, principleTitle: { color: Brand.colors.text, fontSize: 16, fontWeight: "800" }, principleText: { color: Brand.colors.muted, fontSize: 13, lineHeight: 19, marginTop: 5 },
  privacyCard: { flexDirection: "row", marginTop: 18, backgroundColor: Brand.colors.greenSoft, borderRadius: 16, padding: 18 },
  privacyDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Brand.colors.green, marginTop: 4, marginRight: 11 }, privacyCopy: { flex: 1 }, privacyTitle: { color: "#267250", fontSize: 15, fontWeight: "800" }, privacyText: { color: "#467761", fontSize: 13, lineHeight: 19, marginTop: 4 },
});
