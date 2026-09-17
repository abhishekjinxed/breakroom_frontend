import { useCallback, useEffect, useReducer } from "react";
import { Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useTheme } from "../context/ThemeContext";

const COLS = 10;
const ROWS = 20;
const COLORS = ["", "#E35D6A", "#E7AE4E", "#4CB7AD", "#8670D8", "#DD7EAD", "#63A869", "#4A8BD7"];
const SHAPES = [
  [[1, 1, 1, 1]], [[2, 2], [2, 2]], [[0, 3, 0], [3, 3, 3]], [[4, 0, 0], [4, 4, 4]], [[0, 0, 5], [5, 5, 5]], [[0, 6, 6], [6, 6, 0]], [[7, 7, 0], [0, 7, 7]],
];
type Board = number[][];
type Piece = { shape: number[][]; x: number; y: number };
type State = { board: Board; piece: Piece; score: number; lines: number; over: boolean; started: boolean };
type Action = { type: "START" | "TICK" | "DROP" | "ROTATE" } | { type: "MOVE"; dx: number };

const emptyBoard = (): Board => Array.from({ length: ROWS }, () => Array(COLS).fill(0));
const freshPiece = (): Piece => { const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)]; return { shape: shape.map((row) => [...row]), x: Math.floor((COLS - shape[0].length) / 2), y: 0 }; };
const initial = (): State => ({ board: emptyBoard(), piece: freshPiece(), score: 0, lines: 0, over: false, started: false });
const overlaps = (board: Board, piece: Piece) => piece.shape.some((row, py) => row.some((cell, px) => cell && (piece.x + px < 0 || piece.x + px >= COLS || piece.y + py >= ROWS || (piece.y + py >= 0 && board[piece.y + py][piece.x + px]))));
const rotate = (shape: number[][]) => shape[0].map((_, index) => shape.map((row) => row[index]).reverse());
function lock(state: State): State {
  const board = state.board.map((row) => [...row]);
  state.piece.shape.forEach((row, py) => row.forEach((cell, px) => { if (cell && state.piece.y + py >= 0) board[state.piece.y + py][state.piece.x + px] = cell; }));
  const kept = board.filter((row) => row.some((cell) => !cell));
  const cleared = ROWS - kept.length;
  while (kept.length < ROWS) kept.unshift(Array(COLS).fill(0));
  const piece = freshPiece();
  return { ...state, board: kept, piece, lines: state.lines + cleared, score: state.score + [0, 100, 300, 500, 800][cleared], over: overlaps(kept, piece) };
}
function reducer(state: State, action: Action): State {
  if (action.type === "START") return { ...initial(), started: true };
  if (state.over || !state.started) return state;
  if (action.type === "MOVE") { const piece = { ...state.piece, x: state.piece.x + action.dx }; return overlaps(state.board, piece) ? state : { ...state, piece }; }
  if (action.type === "ROTATE") { const piece = { ...state.piece, shape: rotate(state.piece.shape) }; return overlaps(state.board, piece) ? state : { ...state, piece }; }
  if (action.type === "DROP") { let piece = state.piece; while (!overlaps(state.board, { ...piece, y: piece.y + 1 })) piece = { ...piece, y: piece.y + 1 }; return lock({ ...state, piece }); }
  const piece = { ...state.piece, y: state.piece.y + 1 };
  return overlaps(state.board, piece) ? lock(state) : { ...state, piece };
}
function renderBoard(state: State) {
  const board = state.board.map((row) => [...row]);
  state.piece.shape.forEach((row, py) => row.forEach((cell, px) => { const y = state.piece.y + py; const x = state.piece.x + px; if (cell && y >= 0 && y < ROWS && x >= 0 && x < COLS) board[y][x] = cell; }));
  return board;
}

export default function TetrisScreen() {
  const { colors } = useTheme();
  const [state, dispatch] = useReducer(reducer, undefined, initial);
  const start = useCallback(() => dispatch({ type: "START" }), []);
  useEffect(() => { if (!state.started || state.over) return; const timer = setInterval(() => dispatch({ type: "TICK" }), Math.max(230, 760 - Math.floor(state.lines / 10) * 60)); return () => clearInterval(timer); }, [state.started, state.over, state.lines]);
  useEffect(() => { if (Platform.OS !== "web") return; const onKey = (event: KeyboardEvent) => { if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) event.preventDefault(); if (event.key === "ArrowLeft") dispatch({ type: "MOVE", dx: -1 }); if (event.key === "ArrowRight") dispatch({ type: "MOVE", dx: 1 }); if (event.key === "ArrowUp") dispatch({ type: "ROTATE" }); if (event.key === "ArrowDown" || event.key === " ") dispatch({ type: "DROP" }); }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, []);
  const board = renderBoard(state);
  return <SafeAreaView style={[styles.safe, { backgroundColor: colors.canvas }]}><View style={styles.content}>
    <TouchableOpacity onPress={() => router.replace("/games" as any)} hitSlop={10}><Text style={[styles.back, { color: colors.teal }]}>← Games</Text></TouchableOpacity>
    <View style={styles.heading}><View><Text style={[styles.eyebrow, { color: colors.teal }]}>SOLO BREAK</Text><Text style={[styles.title, { color: colors.navy }]}>Tetris</Text></View><View style={[styles.score, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.scoreLabel, { color: colors.muted }]}>SCORE</Text><Text style={[styles.scoreNumber, { color: colors.teal }]}>{state.score}</Text></View></View>
    <Text style={[styles.subtitle, { color: colors.muted }]}>Clear lines and reset your mind. {Platform.OS === "web" ? "Use arrow keys, or the controls below." : "Use the touch controls below."}</Text>
    {!state.started ? <TouchableOpacity onPress={start} style={[styles.start, { backgroundColor: colors.teal }]}><Text style={styles.startText}>Start game</Text></TouchableOpacity> : <>
      <View style={[styles.board, { borderColor: colors.border }]}>{board.flatMap((row, y) => row.map((cell, x) => <View key={`${y}-${x}`} style={[styles.cell, { backgroundColor: cell ? COLORS[cell] : colors.surface, borderColor: colors.canvas }]} />))}</View>
      <View style={styles.meta}><Text style={[styles.metaText, { color: colors.muted }]}>{state.lines} {state.lines === 1 ? "line" : "lines"} cleared</Text>{state.over && <Text style={styles.over}>Game over</Text>}</View>
      <View style={styles.controls}><TouchableOpacity accessibilityLabel="Move left" onPress={() => dispatch({ type: "MOVE", dx: -1 })} style={[styles.control, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.controlText, { color: colors.text }]}>←</Text></TouchableOpacity><TouchableOpacity accessibilityLabel="Rotate" onPress={() => dispatch({ type: "ROTATE" })} style={[styles.control, styles.rotate, { backgroundColor: colors.teal }]}><Text style={styles.rotateText}>↻</Text></TouchableOpacity><TouchableOpacity accessibilityLabel="Move right" onPress={() => dispatch({ type: "MOVE", dx: 1 })} style={[styles.control, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.controlText, { color: colors.text }]}>→</Text></TouchableOpacity><TouchableOpacity accessibilityLabel="Drop piece" onPress={() => dispatch({ type: "DROP" })} style={[styles.drop, { backgroundColor: colors.hero }]}><Text style={styles.dropText}>Drop ↓</Text></TouchableOpacity></View>
      {state.over && <TouchableOpacity onPress={start} style={[styles.start, { backgroundColor: colors.teal }]}><Text style={styles.startText}>Play again</Text></TouchableOpacity>}
    </>}
  </View></SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1 }, content: { flex: 1, padding: 22, alignItems: "center" }, back: { alignSelf: "stretch", fontSize: 13, fontWeight: "900", marginBottom: 23 }, heading: { alignSelf: "stretch", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }, eyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 1.3 }, title: { fontSize: 31, fontWeight: "900", marginTop: 7 }, score: { borderWidth: 1, borderRadius: 13, paddingVertical: 7, paddingHorizontal: 13, alignItems: "flex-end" }, scoreLabel: { fontSize: 8, fontWeight: "900", letterSpacing: 1 }, scoreNumber: { fontSize: 19, fontWeight: "900", marginTop: 2 }, subtitle: { alignSelf: "stretch", fontSize: 13, lineHeight: 19, marginTop: 10 }, start: { alignSelf: "stretch", borderRadius: 13, minHeight: 54, alignItems: "center", justifyContent: "center", marginTop: 26 }, startText: { color: "#FFF", fontSize: 16, fontWeight: "900" }, board: { width: 280, height: 448, marginTop: 19, borderWidth: 3, borderRadius: 10, overflow: "hidden", flexDirection: "row", flexWrap: "wrap", backgroundColor: "#12282B" }, cell: { width: "10%", height: "5%", borderWidth: 0.5 }, meta: { alignSelf: "stretch", flexDirection: "row", justifyContent: "space-between", marginTop: 9 }, metaText: { fontSize: 12, fontWeight: "800" }, over: { color: "#B8443F", fontSize: 12, fontWeight: "900" }, controls: { alignSelf: "stretch", flexDirection: "row", gap: 9, marginTop: 16 }, control: { flex: 1, height: 52, borderWidth: 1, borderRadius: 13, alignItems: "center", justifyContent: "center" }, controlText: { fontSize: 25, fontWeight: "900" }, rotate: { flex: 1.05 }, rotateText: { color: "#FFF", fontSize: 25, fontWeight: "900" }, drop: { flex: 1.5, height: 52, borderRadius: 13, alignItems: "center", justifyContent: "center" }, dropText: { color: "#FFF", fontSize: 13, fontWeight: "900" } });
