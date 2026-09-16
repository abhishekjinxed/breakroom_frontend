import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Brand } from "../constants/brand";

export default function ChildSafetyScreen() {
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
    <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
    <Text style={styles.eyebrow}>BREAKROOM SAFETY</Text>
    <Text style={styles.title}>Child Safety Standards</Text>
    <Text style={styles.copy}>Breakroom is intended for adults aged 18 and over. We have zero tolerance for child sexual abuse and exploitation (CSAE), child sexual abuse material (CSAM), grooming, or any content or conduct that sexualizes, exploits, or endangers a child.</Text>

    <Text style={styles.heading}>What is prohibited</Text>
    <Text style={styles.copy}>Members must not create, share, request, promote, or facilitate CSAM, CSAE, grooming, trafficking, or any sexualized content involving a minor. Members must not use Breakroom to seek contact with children for inappropriate purposes.</Text>

    <Text style={styles.heading}>How to report a concern</Text>
    <Text style={styles.copy}>Use the Report option available on user profiles, messages, Desk Notes, comments, and other community content. You can also block a member. Reports are available in the app and are reviewed by authorized moderators.</Text>

    <Text style={styles.heading}>Our response</Text>
    <Text style={styles.copy}>We review credible child-safety reports, remove or disable violating content, and may restrict or deactivate accounts. When required by law, or where there is a credible risk of child exploitation, we preserve relevant information and report the matter to the appropriate authorities or organizations.</Text>

    <Text style={styles.heading}>Safety contact</Text>
    <Text style={styles.copy}>For child-safety concerns or questions about these standards, contact us at abhishekjinxed@gmail.com.</Text>

    <Text style={styles.heading}>Related policies</Text>
    <TouchableOpacity onPress={() => router.push("/terms")}><Text style={styles.link}>Terms of Use</Text></TouchableOpacity>
    <TouchableOpacity onPress={() => router.push("/privacy")}><Text style={styles.link}>Privacy Policy</Text></TouchableOpacity>
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.colors.canvas },
  content: { padding: 24, paddingBottom: 50 },
  back: { color: Brand.colors.teal, fontWeight: "800" },
  eyebrow: { color: Brand.colors.teal, letterSpacing: 1.2, fontSize: 11, fontWeight: "800", marginTop: 28 },
  title: { color: Brand.colors.navy, fontSize: 32, fontWeight: "800", marginTop: 8 },
  heading: { color: Brand.colors.navy, fontSize: 18, fontWeight: "800", marginTop: 26 },
  copy: { color: Brand.colors.text, fontSize: 15, lineHeight: 23, marginTop: 10 },
  link: { color: Brand.colors.teal, fontSize: 15, fontWeight: "800", marginTop: 12 },
});
