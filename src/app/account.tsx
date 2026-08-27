import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Brand } from "../constants/brand";
import { useAuth } from "../context/AuthContext";
import { deleteAccount } from "../api/safety";
import { useLanguage } from "../context/LanguageContext";
import { languageNames, supportedLanguages } from "../i18n/translations";

export default function AccountScreen() {
  const { user, token, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  async function remove() { if (!token) return; await deleteAccount(token); await logout(); router.replace("/"); }
  function confirm() { Alert.alert(t("deleteTitle"), t("deleteText"), [{ text: t("cancel"), style: "cancel" }, { text: t("delete"), style: "destructive", onPress: remove }]); }
  return <SafeAreaView style={styles.safe}><View style={styles.content}>
    <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>{t("back")}</Text></TouchableOpacity>
    <Text style={styles.title}>{t("accountPrivacy")}</Text><Text style={styles.name}>{user?.anonymousUsername}</Text>
    <View style={styles.languageCard}><Text style={styles.languageTitle}>{t("language")}</Text><Text style={styles.languageHelp}>{t("languageHelp")}</Text><View style={styles.languageOptions}>{supportedLanguages.map((code) => <TouchableOpacity key={code} onPress={() => setLanguage(code)} style={[styles.languageOption, language === code && styles.languageOptionActive]}><Text style={[styles.languageOptionText, language === code && styles.languageOptionTextActive]}>{languageNames[code]}</Text></TouchableOpacity>)}</View></View>
    <TouchableOpacity onPress={() => router.push("/terms")} style={styles.row}><Text style={styles.rowText}>{t("terms")}</Text><Text>›</Text></TouchableOpacity><TouchableOpacity onPress={() => router.push("/privacy")} style={styles.row}><Text style={styles.rowText}>{t("privacy")}</Text><Text>›</Text></TouchableOpacity><TouchableOpacity onPress={confirm} style={styles.delete}><Text style={styles.deleteText}>{t("deleteAccount")}</Text></TouchableOpacity>
  </View></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: Brand.colors.canvas }, content: { padding: 24 }, back: { color: Brand.colors.teal, fontWeight: "800" }, title: { color: Brand.colors.navy, fontSize: 28, fontWeight: "800", marginTop: 28 }, name: { color: Brand.colors.muted, marginTop: 7 }, languageCard: { backgroundColor: Brand.colors.surface, padding: 17, borderRadius: 14, marginTop: 24, borderWidth: 1, borderColor: Brand.colors.border }, languageTitle: { color: Brand.colors.text, fontWeight: "800", fontSize: 16 }, languageHelp: { color: Brand.colors.muted, fontSize: 13, lineHeight: 19, marginTop: 5 }, languageOptions: { flexDirection: "row", gap: 8, marginTop: 15 }, languageOption: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: Brand.colors.border, alignItems: "center" }, languageOptionActive: { backgroundColor: Brand.colors.teal, borderColor: Brand.colors.teal }, languageOptionText: { color: Brand.colors.text, fontSize: 12, fontWeight: "800" }, languageOptionTextActive: { color: "#FFF" }, row: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#FFF", padding: 17, borderRadius: 14, marginTop: 18 }, rowText: { color: Brand.colors.text, fontWeight: "700" }, delete: { marginTop: 32, padding: 16, borderWidth: 1, borderColor: Brand.colors.danger, borderRadius: 14, alignItems: "center" }, deleteText: { color: Brand.colors.danger, fontWeight: "800" } });
