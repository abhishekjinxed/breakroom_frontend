import { useEffect, useState } from "react";
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

type Puzzle = { solution: number[]; clues: number[]; cells: number[] };
const SIDE = 4;

function seededRandom(seed: number) {
  let value = seed || 1;
  return () => { value = (value * 1664525 + 1013904223) >>> 0; return value / 4294967296; };
}

function shuffled<T>(values: T[], random: () => number) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function candidates(board: number[], cell: number) {
  const row = Math.floor(cell / SIDE);
  const col = cell % SIDE;
  const used = new Set<number>();
  for (let i = 0; i < SIDE; i++) { used.add(board[row * SIDE + i]); used.add(board[i * SIDE + col]); }
  const boxRow = Math.floor(row / 2) * 2;
  const boxCol = Math.floor(col / 2) * 2;
  for (let r = boxRow; r < boxRow + 2; r++) for (let c = boxCol; c < boxCol + 2; c++) used.add(board[r * SIDE + c]);
  return [1, 2, 3, 4].filter((number) => !used.has(number));
}

function solutionCount(board: number[]): number {
  let bestCell = -1;
  let bestCandidates: number[] = [];
  for (let cell = 0; cell < board.length; cell++) {
    if (board[cell] !== 0) continue;
    const options = candidates(board, cell);
    if (!options.length) return 0;
    if (bestCell < 0 || options.length < bestCandidates.length) { bestCell = cell; bestCandidates = options; }
  }
  if (bestCell < 0) return 1;
  let count = 0;
  for (const number of bestCandidates) {
    const next = [...board];
    next[bestCell] = number;
    count += solutionCount(next);
    if (count > 1) return 2;
  }
  return count;
}

function makePuzzle(seed: number): Puzzle {
  const random = seededRandom(seed);
  const rowBands = shuffled([0, 1], random).flatMap((band) => shuffled([0, 1], random).map((row) => band * 2 + row));
  const colBands = shuffled([0, 1], random).flatMap((band) => shuffled([0, 1], random).map((col) => band * 2 + col));
  const digits = shuffled([1, 2, 3, 4], random);
  const solution = rowBands.flatMap((row) => colBands.map((col) => digits[(row * 2 + Math.floor(row / 2) + col) % SIDE]));
  const clues = [...solution];
  for (const cell of shuffled(Array.from({ length: 16 }, (_, index) => index), random)) {
    clues[cell] = 0;
    if (solutionCount(clues) !== 1) clues[cell] = solution[cell];
  }
  return { solution, clues, cells: [...clues] };
}

export default function MiniSudokuScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [puzzle, setPuzzle] = useState(() => makePuzzle(Date.now() >>> 0));
  const [selected, setSelected] = useState(() => puzzle.clues.findIndex((value) => value === 0));
  const [mistakes, setMistakes] = useState(0);
  const [solved, setSolved] = useState(false);
  const [wrongCells, setWrongCells] = useState<number[]>([]);

  const enterNumber = (number: number) => {
    if (solved || selected < 0 || puzzle.clues[selected] !== 0) return;
    const cells = [...puzzle.cells];
    cells[selected] = number;
    const wrong = number !== puzzle.solution[selected];
    setPuzzle((current) => ({ ...current, cells }));
    if (wrong) { setMistakes((current) => current + 1); setWrongCells((current) => current.includes(selected) ? current : [...current, selected]); }
    else setWrongCells((current) => current.filter((cell) => cell !== selected));
    if (cells.every((value, index) => value === puzzle.solution[index])) setSolved(true);
  };

  const clearCell = () => {
    if (solved || selected < 0 || puzzle.clues[selected] !== 0) return;
    setPuzzle((current) => { const cells = [...current.cells]; cells[selected] = 0; return { ...current, cells }; });
    setWrongCells((current) => current.filter((cell) => cell !== selected));
  };

  const newPuzzle = () => {
    const next = makePuzzle((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0);
    setPuzzle(next); setSelected(next.clues.findIndex((value) => value === 0)); setMistakes(0); setSolved(false); setWrongCells([]);
  };

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key >= "1" && event.key <= "4") enterNumber(Number(event.key));
      else if (event.key === "Backspace" || event.key === "Delete") clearCell();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const selectedValue = selected >= 0 ? puzzle.cells[selected] : 0;
  return <SafeAreaView style={[styles.safe, { backgroundColor: colors.canvas }]}><ScrollView contentContainerStyle={styles.content}>
    <TouchableOpacity onPress={() => router.replace("/" as any)} hitSlop={10}><Text style={[styles.back, { color: colors.teal }]}>{t("backToDesk")}</Text></TouchableOpacity>
    <View style={styles.heading}><View style={styles.headingCopy}><Text style={[styles.eyebrow, { color: colors.teal }]}>{t("soloBreak")}</Text><Text style={[styles.title, { color: colors.navy }]}>{t("miniSudoku")}</Text></View><TouchableOpacity onPress={newPuzzle} style={[styles.newButton, { backgroundColor: colors.teal }]}><Text style={styles.newButtonText}>{t("newPuzzle")}</Text></TouchableOpacity></View>
    <Text style={[styles.subtitle, { color: colors.muted }]}>{t("sudokuSubtitle")}</Text>
    <View style={styles.meta}><Text style={[styles.instruction, { color: colors.muted }]}>{solved ? t("puzzleSolved") : selectedValue ? t("chooseNumber") : t("chooseSquare")}</Text><Text style={[styles.mistakes, { color: colors.muted }]}>{t("mistakes")}: {mistakes}</Text></View>
    <View accessibilityLabel="Mini Sudoku 4 by 4 board" style={[styles.board, { borderColor: colors.teal }]}>{Array.from({ length: 4 }, (_, row) => <View key={row} style={styles.row}>{Array.from({ length: 4 }, (_, col) => {
      const cell = row * 4 + col;
      const isSelected = selected === cell;
      const sameValue = selectedValue > 0 && puzzle.cells[cell] === selectedValue;
      const isWrong = wrongCells.includes(cell);
      return <TouchableOpacity key={cell} accessibilityRole="button" accessibilityLabel={`Row ${row + 1}, column ${col + 1}${puzzle.cells[cell] ? `, ${puzzle.cells[cell]}` : ", empty"}`} onPress={() => setSelected(cell)} style={[styles.cell, { backgroundColor: isSelected ? colors.tealSoft : sameValue ? colors.surfaceSoft : colors.surface, borderColor: colors.border }, col % 2 === 1 && styles.boxRight, row % 2 === 1 && styles.boxBottom, isWrong && styles.wrongCell, isSelected && styles.selectedCell]}><Text style={[styles.cellText, { color: isWrong ? colors.danger : puzzle.clues[cell] ? colors.navy : colors.text }]}>{puzzle.cells[cell] || ""}</Text></TouchableOpacity>;
    })}</View>)}</View>
    {solved ? <View style={[styles.solvedBanner, { backgroundColor: colors.tealSoft }]}><Text style={[styles.solvedText, { color: colors.teal }]}>{t("puzzleSolved")}</Text></View> : <>
      <Text style={[styles.padLabel, { color: colors.muted }]}>{t("chooseNumber")}</Text>
      <View style={styles.numberPad}>{[1, 2, 3, 4].map((number) => <TouchableOpacity key={number} accessibilityRole="button" accessibilityLabel={`Enter ${number}`} disabled={selected < 0 || puzzle.clues[selected] !== 0} onPress={() => enterNumber(number)} style={[styles.numberButton, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.numberText, { color: colors.teal }]}>{number}</Text></TouchableOpacity>)}</View>
      <TouchableOpacity accessibilityRole="button" onPress={clearCell} disabled={selected < 0 || puzzle.clues[selected] !== 0} style={[styles.clearButton, { borderColor: colors.border }]}><Text style={[styles.clearText, { color: colors.muted }]}>{t("clearSquare")}</Text></TouchableOpacity>
    </>}
    <TouchableOpacity accessibilityRole="button" onPress={newPuzzle} style={[styles.playAgain, { backgroundColor: colors.hero }]}><Text style={styles.playAgainText}>{t("newPuzzle")}</Text></TouchableOpacity>
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, content: { padding: 22, paddingBottom: 40, alignItems: "center" }, back: { alignSelf: "stretch", fontSize: 13, fontWeight: "900", marginBottom: 22 }, heading: { width: "100%", maxWidth: 390, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }, headingCopy: { flex: 1 }, eyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 1.3 }, title: { fontSize: 30, fontWeight: "900", marginTop: 5 }, newButton: { paddingVertical: 11, paddingHorizontal: 14, borderRadius: 12 }, newButtonText: { color: "#FFF", fontSize: 12, fontWeight: "900" }, subtitle: { width: "100%", maxWidth: 390, fontSize: 13, lineHeight: 19, marginTop: 9 }, meta: { width: "100%", maxWidth: 390, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 22 }, instruction: { flex: 1, fontSize: 12, lineHeight: 17, fontWeight: "700" }, mistakes: { fontSize: 11, fontWeight: "800" }, board: { width: "100%", maxWidth: 360, aspectRatio: 1, borderWidth: 2, borderRadius: 12, overflow: "hidden", marginTop: 12 }, row: { flex: 1, flexDirection: "row" }, cell: { flex: 1, alignItems: "center", justifyContent: "center", borderWidth: 0.5 }, boxRight: { borderRightWidth: 2 }, boxBottom: { borderBottomWidth: 2 }, wrongCell: { backgroundColor: "#FCE3E0" }, selectedCell: { borderWidth: 2, borderColor: "#168783" }, cellText: { fontSize: 30, fontWeight: "800" }, padLabel: { width: "100%", maxWidth: 360, marginTop: 18, marginBottom: 8, fontSize: 11, fontWeight: "800" }, numberPad: { width: "100%", maxWidth: 360, flexDirection: "row", gap: 9 }, numberButton: { flex: 1, height: 56, borderWidth: 1, borderRadius: 13, alignItems: "center", justifyContent: "center" }, numberText: { fontSize: 22, fontWeight: "900" }, clearButton: { alignSelf: "stretch", maxWidth: 360, borderWidth: 1, borderRadius: 12, alignItems: "center", justifyContent: "center", minHeight: 42, marginTop: 9 }, clearText: { fontSize: 12, fontWeight: "800" }, solvedBanner: { alignSelf: "stretch", maxWidth: 360, alignItems: "center", padding: 13, marginTop: 17, borderRadius: 12 }, solvedText: { fontSize: 14, fontWeight: "900" }, playAgain: { width: "100%", maxWidth: 360, minHeight: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 15 }, playAgainText: { color: "#FFF", fontSize: 13, fontWeight: "900" },
});
