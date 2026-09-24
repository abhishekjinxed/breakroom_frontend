import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { PublicAvatar, PublicFlair } from "../components/PublicIdentity";
import { getCurrentTicTacToe, joinTicTacToe, leaveTicTacToe, playTicTacToeMove, TicTacToeGame } from "../api/tic-tac-toe";
import { sendCharterPaperPlane } from "../api/bored";

export default function TicTacToeScreen() {
  const { token } = useAuth();
  const { colors } = useTheme();
  const [game, setGame] = useState<TicTacToeGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [charterOpen, setCharterOpen] = useState(false);
  const [charterMessage, setCharterMessage] = useState("");
  const [charterBusy, setCharterBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (quiet = false) => {
    if (!token) return;
    try {
      if (!quiet) setLoading(true);
      const result = await getCurrentTicTacToe(token);
      setGame(result.game);
      setError(null);
    } catch (requestError: any) {
      if (!quiet) setError(requestError?.response?.data?.message ?? "The game table could not load.");
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!game || !["WAITING", "ACTIVE"].includes(game.status)) return;
    const interval = setInterval(() => load(true), 5000);
    return () => clearInterval(interval);
  }, [game?.id, game?.status, load]);

  const join = async () => {
    if (!token || busy) return;
    try {
      setBusy(true);
      const result = await joinTicTacToe(token);
      setGame(result.game);
      setCharterOpen(false);
      setCharterMessage("");
      setError(null);
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message ?? "Unable to join an open match.");
    } finally { setBusy(false); }
  };

  const move = async (cell: number) => {
    if (!token || !game || !game.yourTurn || busy || game.board[cell] !== ".") return;
    try {
      setBusy(true);
      const result = await playTicTacToeMove(token, game.id, cell);
      setGame(result.game);
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message ?? "That move could not be played.");
      load(true);
    } finally { setBusy(false); }
  };

  const leave = async () => {
    if (!token || !game || busy) return;
    try {
      setBusy(true);
      await leaveTicTacToe(token, game.id);
      setGame(null);
      setError(null);
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message ?? "Unable to leave this match.");
    } finally { setBusy(false); }
  };

  const sendCharter = async () => {
    const message = charterMessage.trim();
    if (!token || !game?.opponent || !message || charterBusy) return;
    try {
      setCharterBusy(true);
      const result = await sendCharterPaperPlane(token, game.opponent.id, message);
      Alert.alert("Charter Plane sent", `Your red plane is on ${game.opponent.publicFlair || game.opponent.anonymousUsername}'s desk for 24 hours. ${result.wallet.balance.toLocaleString("en-IN")} Paisa remaining.`);
      setCharterOpen(false);
      setCharterMessage("");
    } catch (requestError: any) {
      Alert.alert("Charter Plane", requestError?.response?.data?.message ?? "Unable to send the Charter Plane.");
    } finally { setCharterBusy(false); }
  };

  if (loading) return <SafeAreaView style={[styles.safe, { backgroundColor: colors.canvas }]}><ActivityIndicator color={colors.teal} style={styles.loader} /></SafeAreaView>;
  return <SafeAreaView style={[styles.safe, { backgroundColor: colors.canvas }]}><View style={styles.content}>
    <TouchableOpacity onPress={() => router.replace("/" as any)} hitSlop={10}><Text style={[styles.back, { color: colors.teal }]}>← Back to desk</Text></TouchableOpacity>
    <Text style={[styles.eyebrow, { color: colors.teal }]}>OPEN GAME TABLE</Text>
    <Text style={[styles.title, { color: colors.navy }]}>Tic-Tac-Toe</Text>
    <Text style={[styles.subtitle, { color: colors.muted }]}>A quick anonymous match. No profile directory, no chat — just a small break.</Text>
    {error && <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>}
    {!game && <View style={[styles.hero, { backgroundColor: colors.hero }]}><Text style={[styles.heroLabel, { color: colors.mint }]}>OPEN MATCH</Text><Text style={styles.heroTitle}>Take the first seat.</Text><Text style={styles.heroCopy}>We will pair you with the next available Breakroom member. Matches expire quietly if nobody joins.</Text><TouchableOpacity disabled={busy} onPress={join} style={[styles.primaryButton, { backgroundColor: colors.mint }, busy && styles.disabled]}><Text style={[styles.primaryButtonText, { color: colors.onAccent }]}>{busy ? "Joining…" : "Find an opponent"}</Text></TouchableOpacity></View>}
    {game?.status === "WAITING" && <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}><ActivityIndicator color={colors.teal} /><Text style={[styles.cardTitle, { color: colors.text }]}>Your seat is open.</Text><Text style={[styles.copy, { color: colors.muted }]}>Waiting for one opponent. Keep Breakroom open and the board will appear automatically.</Text><Board board={game.board} disabled colors={colors} onMove={move} /><TouchableOpacity disabled={busy} onPress={leave} style={[styles.outlineButton, { borderColor: colors.border }]}><Text style={[styles.outlineText, { color: colors.muted }]}>Cancel search</Text></TouchableOpacity></View>}
    {game?.status === "ACTIVE" && <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}><Opponent game={game} colors={colors} /><Text style={[styles.turn, { color: game.yourTurn ? colors.teal : colors.muted }]}>{game.yourTurn ? `Your turn — play ${game.mark}` : `${game.opponent?.publicFlair || game.opponent?.anonymousUsername || "Your opponent"} is thinking…`}</Text><Board board={game.board} disabled={!game.yourTurn || busy} colors={colors} onMove={move} /><Text style={[styles.yourMark, { color: colors.muted }]}>You are {game.mark}</Text><TouchableOpacity disabled={busy} onPress={leave} style={styles.leaveLink}><Text style={[styles.leaveText, { color: colors.muted }]}>Leave match</Text></TouchableOpacity></View>}
    {game?.status === "FINISHED" && <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}><Opponent game={game} colors={colors} /><Text style={[styles.finishedTitle, { color: colors.text }]}>{game.isDraw ? "A thoughtful draw." : game.winnerMark === game.mark ? "You won this round." : "Good game."}</Text><Text style={[styles.copy, { color: colors.muted }]}>{game.isDraw ? "Both of you held the line." : "Start another open match whenever you are ready."}</Text><Board board={game.board} disabled colors={colors} onMove={move} />{game.opponent && <TouchableOpacity disabled={busy} onPress={() => { setCharterMessage(""); setCharterOpen(true); }} style={[styles.charterButton, busy && styles.disabled]}><Text style={styles.charterButtonText}>Send Charter Plane · 100 Paisa</Text><Text style={styles.charterButtonHelp}>Direct delivery · 24 hours</Text></TouchableOpacity>}<TouchableOpacity disabled={busy} onPress={join} style={[styles.primaryButton, { backgroundColor: colors.teal }, busy && styles.disabled]}><Text style={styles.newMatchText}>{busy ? "Joining…" : "Find another match"}</Text></TouchableOpacity></View>}
  </View><Modal transparent visible={charterOpen} animationType="fade" onRequestClose={() => !charterBusy && setCharterOpen(false)}><View style={styles.backdrop}><View style={[styles.dialog, { backgroundColor: colors.surface }]}><Text style={styles.dialogEyebrow}>GAME FOLLOW-UP</Text><Text style={[styles.dialogTitle, { color: colors.navy }]}>Send Charter Plane?</Text><Text style={[styles.dialogCopy, { color: colors.muted }]}>A red Charter Plane will land directly on {game?.opponent?.publicFlair || game?.opponent?.anonymousUsername}'s desk. It costs 100 Paisa and stays for 24 hours.</Text><Text style={[styles.dialogLabel, { color: colors.text }]}>Your message</Text><TextInput value={charterMessage} onChangeText={setCharterMessage} maxLength={160} multiline placeholder="Write a short note" placeholderTextColor={colors.muted} style={[styles.dialogInput, { color: colors.text, borderColor: colors.border }]} /><Text style={[styles.dialogCount, { color: colors.muted }]}>{charterMessage.length}/160</Text><View style={styles.dialogActions}><TouchableOpacity disabled={charterBusy} onPress={() => setCharterOpen(false)} style={[styles.dialogCancel, { borderColor: colors.border }]}><Text style={[styles.dialogCancelText, { color: colors.muted }]}>Cancel</Text></TouchableOpacity><TouchableOpacity disabled={charterBusy || !charterMessage.trim()} onPress={sendCharter} style={[styles.dialogSend, (charterBusy || !charterMessage.trim()) && styles.disabled]}><Text style={styles.dialogSendText}>{charterBusy ? "Sending…" : "Send for 100 Paisa"}</Text></TouchableOpacity></View></View></View></Modal></SafeAreaView>;
}

function Opponent({ game, colors }: { game: TicTacToeGame; colors: any }) {
  if (!game.opponent) return null;
  return <View style={[styles.opponent, { backgroundColor: colors.tealSoft }]}><PublicAvatar member={game.opponent} size={36} backgroundColor="#D6F2EF" color={colors.teal} /><PublicFlair member={game.opponent} nameColor={colors.text} flairColor={colors.muted} /><Text style={[styles.mark, { color: colors.teal }]}>{game.mark === "X" ? "O" : "X"}</Text></View>;
}

function Board({ board, disabled, colors, onMove }: { board: string; disabled: boolean; colors: any; onMove: (cell: number) => void }) {
  return <View style={[styles.board, { borderColor: colors.border }]}>{Array.from({ length: 9 }, (_, cell) => <TouchableOpacity key={cell} disabled={disabled || board[cell] !== "."} onPress={() => onMove(cell)} style={[styles.cell, { borderColor: colors.border }]}><Text style={[styles.cellMark, { color: board[cell] === "X" ? colors.teal : "#B8443F" }]}>{board[cell] === "." ? "" : board[cell]}</Text></TouchableOpacity>)}</View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, loader: { marginTop: 110 }, content: { flex: 1, padding: 22 }, back: { fontSize: 13, fontWeight: "900", marginBottom: 23 }, eyebrow: { fontSize: 10, letterSpacing: 1.4, fontWeight: "900" }, title: { fontSize: 31, lineHeight: 38, fontWeight: "900", marginTop: 8 }, subtitle: { fontSize: 14, lineHeight: 21, marginTop: 8, maxWidth: 340 }, error: { fontSize: 12, lineHeight: 18, fontWeight: "700", marginTop: 14 }, hero: { borderRadius: 22, padding: 22, marginTop: 25 }, heroLabel: { fontSize: 10, letterSpacing: 1.3, fontWeight: "900" }, heroTitle: { color: "#FFF", fontSize: 23, fontWeight: "900", marginTop: 10 }, heroCopy: { color: "#DCE4F5", lineHeight: 20, fontSize: 14, marginTop: 8 }, primaryButton: { borderRadius: 13, paddingVertical: 14, alignItems: "center", marginTop: 19 }, primaryButtonText: { fontSize: 14, fontWeight: "900" }, newMatchText: { color: "#FFF", fontSize: 14, fontWeight: "900" }, card: { borderWidth: 1, borderRadius: 21, padding: 18, marginTop: 24, alignItems: "center" }, cardTitle: { fontSize: 20, fontWeight: "900", marginTop: 12 }, copy: { fontSize: 13, lineHeight: 20, marginTop: 7, textAlign: "center" }, opponent: { alignSelf: "stretch", borderRadius: 14, padding: 11, flexDirection: "row", alignItems: "center", gap: 9 }, mark: { marginLeft: "auto", fontSize: 22, fontWeight: "900" }, turn: { fontSize: 14, fontWeight: "900", marginTop: 18, textAlign: "center" }, board: { width: 264, height: 264, marginTop: 20, borderWidth: 1, flexDirection: "row", flexWrap: "wrap", borderRadius: 12, overflow: "hidden" }, cell: { width: "33.333333%", height: "33.333333%", borderWidth: 0.5, alignItems: "center", justifyContent: "center" }, cellMark: { fontSize: 45, lineHeight: 52, fontWeight: "900" }, yourMark: { fontSize: 11, fontWeight: "800", marginTop: 10 }, outlineButton: { alignSelf: "stretch", borderWidth: 1, borderRadius: 12, paddingVertical: 12, alignItems: "center", marginTop: 20 }, outlineText: { fontSize: 12, fontWeight: "900" }, leaveLink: { padding: 15, marginTop: 2 }, leaveText: { fontSize: 12, fontWeight: "900" }, finishedTitle: { fontSize: 21, fontWeight: "900", marginTop: 17 }, charterButton: { alignSelf: "stretch", backgroundColor: "#B8443F", borderRadius: 12, paddingVertical: 12, alignItems: "center", marginTop: 17 }, charterButtonText: { color: "#FFF", fontSize: 13, fontWeight: "900" }, charterButtonHelp: { color: "#FFE7E2", fontSize: 10, fontWeight: "800", marginTop: 3 }, backdrop: { flex: 1, backgroundColor: "rgba(29, 18, 13, .65)", justifyContent: "center", padding: 22 }, dialog: { borderRadius: 20, padding: 20 }, dialogEyebrow: { color: "#B8443F", fontSize: 10, fontWeight: "900", letterSpacing: 1.2 }, dialogTitle: { fontSize: 22, fontWeight: "900", marginTop: 7 }, dialogCopy: { fontSize: 13, lineHeight: 20, marginTop: 9 }, dialogLabel: { fontSize: 12, fontWeight: "900", marginTop: 16 }, dialogInput: { minHeight: 82, textAlignVertical: "top", borderWidth: 1, borderRadius: 12, padding: 10, marginTop: 7 }, dialogCount: { textAlign: "right", fontSize: 10, fontWeight: "800", marginTop: 4 }, dialogActions: { flexDirection: "row", gap: 9, marginTop: 18 }, dialogCancel: { flex: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 13, alignItems: "center" }, dialogCancelText: { fontWeight: "900", fontSize: 12 }, dialogSend: { flex: 1, backgroundColor: "#B8443F", borderRadius: 12, paddingVertical: 13, alignItems: "center" }, dialogSendText: { color: "#FFF", fontWeight: "900", fontSize: 12 }, disabled: { opacity: 0.5 },
});
