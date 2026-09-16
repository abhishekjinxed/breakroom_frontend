import { api } from "./client";

const auth = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });

export type TicTacToeOpponent = {
  id: string;
  anonymousUsername: string;
  publicAvatarUrl?: string | null;
  publicFlair?: string | null;
};

export type TicTacToeGame = {
  id: string;
  status: "WAITING" | "ACTIVE" | "FINISHED" | "CANCELLED";
  board: string;
  createdAt: string;
  finishedAt: string | null;
  mark: "X" | "O";
  yourTurn: boolean;
  winnerMark: "X" | "O" | null;
  isDraw: boolean;
  opponent: TicTacToeOpponent | null;
};

export async function getCurrentTicTacToe(token: string) {
  return (await api.get("/api/games/tic-tac-toe/current", auth(token))).data as { game: TicTacToeGame | null };
}

export async function joinTicTacToe(token: string) {
  return (await api.post("/api/games/tic-tac-toe/join", {}, auth(token))).data as { game: TicTacToeGame };
}

export async function playTicTacToeMove(token: string, gameId: string, cell: number) {
  return (await api.post(`/api/games/tic-tac-toe/${gameId}/move`, { cell }, auth(token))).data as { game: TicTacToeGame };
}

export async function leaveTicTacToe(token: string, gameId: string) {
  return (await api.delete(`/api/games/tic-tac-toe/${gameId}/leave`, auth(token))).data as { success: boolean; left: boolean };
}
