import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { getModerationReports, getModeratorStatus, ModerationReport, resolveModerationReport } from "../api/safety";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function ModerationScreen() {
  const { token } = useAuth();
  const { colors } = useTheme();
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [workingId, setWorkingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const moderator = await getModeratorStatus(token);
      setAuthorized(moderator);
      if (moderator) setReports(await getModerationReports(token));
    } catch {
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  async function resolve(report: ModerationReport, status: "REVIEWED" | "DISMISSED") {
    if (!token || workingId) return;
    try {
      setWorkingId(report.id);
      await resolveModerationReport(token, report.id, status);
      setReports((current) => current.map((item) => item.id === report.id ? { ...item, status, reviewedAt: new Date().toISOString() } : item));
    } catch (error: any) {
      Alert.alert("Couldn’t update report", error?.response?.data?.message ?? "Please try again.");
    } finally {
      setWorkingId(null);
    }
  }

  if (loading) return <SafeAreaView style={[styles.safe, { backgroundColor: colors.canvas }]}><ActivityIndicator color={colors.teal} style={styles.loader} /></SafeAreaView>;
  if (!authorized) return <SafeAreaView style={[styles.safe, { backgroundColor: colors.canvas }]}><View style={styles.restricted}><Text style={[styles.title, { color: colors.navy }]}>Moderation review</Text><Text style={[styles.copy, { color: colors.muted }]}>This page is restricted to authorized Breakroom moderators.</Text><TouchableOpacity onPress={() => router.back()}><Text style={[styles.back, { color: colors.teal }]}>Back to account</Text></TouchableOpacity></View></SafeAreaView>;

  const openReports = reports.filter((report) => report.status === "OPEN");
  const completedReports = reports.filter((report) => report.status !== "OPEN");
  return <SafeAreaView style={[styles.safe, { backgroundColor: colors.canvas }]}><ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={() => { setLoading(true); load(); }} tintColor={colors.teal} />}>
    <TouchableOpacity onPress={() => router.back()}><Text style={[styles.back, { color: colors.teal }]}>← Back</Text></TouchableOpacity>
    <Text style={[styles.eyebrow, { color: colors.teal }]}>MODERATION</Text><Text style={[styles.title, { color: colors.navy }]}>Report review</Text><Text style={[styles.copy, { color: colors.muted }]}>Review reported content and record the outcome.</Text>
    <Text style={[styles.section, { color: colors.text }]}>Open reports · {openReports.length}</Text>
    {openReports.length ? openReports.map((report) => <ReportCard key={report.id} report={report} working={workingId === report.id} colors={colors} onResolve={resolve} />) : <Text style={[styles.empty, { color: colors.muted }]}>Nothing needs review right now.</Text>}
    {!!completedReports.length && <><Text style={[styles.section, { color: colors.text }]}>Completed</Text>{completedReports.map((report) => <ReportCard key={report.id} report={report} working={false} colors={colors} onResolve={resolve} />)}</>}
  </ScrollView></SafeAreaView>;
}

function ReportCard({ report, working, colors, onResolve }: { report: ModerationReport; working: boolean; colors: any; onResolve: (report: ModerationReport, status: "REVIEWED" | "DISMISSED") => void }) {
  const open = report.status === "OPEN";
  return <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
    <View style={styles.cardTop}><Text style={[styles.type, { color: colors.teal }]}>{report.target.label.toUpperCase()}</Text><Text style={[styles.status, { color: open ? colors.danger : colors.green }]}>{report.status}</Text></View>
    {!!report.target.author && <Text style={[styles.author, { color: colors.text }]}>{report.target.author}</Text>}
    <Text style={[styles.targetText, { color: colors.text }]}>{report.target.text}</Text>
    <View style={[styles.reason, { backgroundColor: colors.surfaceSoft }]}><Text style={[styles.reasonLabel, { color: colors.muted }]}>REPORTED REASON</Text><Text style={[styles.reasonText, { color: colors.text }]}>{report.reason}</Text>{!!report.details && <Text style={[styles.details, { color: colors.muted }]}>{report.details}</Text>}</View>
    <Text style={[styles.meta, { color: colors.muted }]}>Reported by {report.reporter.anonymousUsername} · {new Date(report.createdAt).toLocaleString()}</Text>
    {open && <View style={styles.actions}><TouchableOpacity disabled={working} onPress={() => onResolve(report, "DISMISSED")} style={[styles.dismiss, { borderColor: colors.border }]}><Text style={[styles.dismissText, { color: colors.muted }]}>Dismiss</Text></TouchableOpacity><TouchableOpacity disabled={working} onPress={() => onResolve(report, "REVIEWED")} style={[styles.review, { backgroundColor: colors.navy }]}><Text style={styles.reviewText}>{working ? "Saving…" : "Mark reviewed"}</Text></TouchableOpacity></View>}
  </View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, loader: { marginTop: 100 }, content: { padding: 22, paddingBottom: 44 }, restricted: { padding: 24, marginTop: 70 }, back: { fontWeight: "800" }, eyebrow: { fontSize: 11, fontWeight: "900", letterSpacing: 1.3, marginTop: 24 }, title: { fontSize: 29, fontWeight: "900", marginTop: 7 }, copy: { fontSize: 14, lineHeight: 21, marginTop: 7 }, section: { fontSize: 16, fontWeight: "900", marginTop: 30, marginBottom: 10 }, empty: { fontSize: 14, lineHeight: 20 }, card: { borderWidth: 1, borderRadius: 18, padding: 16, marginBottom: 11 }, cardTop: { flexDirection: "row", justifyContent: "space-between", gap: 10 }, type: { fontSize: 10, fontWeight: "900", letterSpacing: 1 }, status: { fontSize: 10, fontWeight: "900", letterSpacing: .6 }, author: { fontWeight: "900", fontSize: 15, marginTop: 11 }, targetText: { fontSize: 14, lineHeight: 20, marginTop: 5 }, reason: { borderRadius: 11, padding: 11, marginTop: 14 }, reasonLabel: { fontSize: 9, fontWeight: "900", letterSpacing: .8 }, reasonText: { fontSize: 13, fontWeight: "800", marginTop: 4 }, details: { fontSize: 12, lineHeight: 18, marginTop: 5 }, meta: { fontSize: 10, lineHeight: 15, marginTop: 12 }, actions: { flexDirection: "row", gap: 9, marginTop: 15 }, dismiss: { flex: 1, minHeight: 42, borderWidth: 1, borderRadius: 10, alignItems: "center", justifyContent: "center" }, dismissText: { fontWeight: "800" }, review: { flex: 1.3, minHeight: 42, borderRadius: 10, alignItems: "center", justifyContent: "center" }, reviewText: { color: "#FFF", fontWeight: "900", fontSize: 12 },
});
