import { api } from "./client";

const auth = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });

export type ConnectFourOpponent = {
  id: string;
  anonymousUsername: string;
  publicAvatarUrl?: string | null;
  publicFlair?: string | null;
};

export type ConnectFourGame = {
  id: string;
  status: "WAITING" | "ACTIVE" | "FINISHED" | "CANCELLED";
  board: string;
  createdAt: string;
  finishedAt: string | null;
  color: "R" | "Y";
  yourTurn: boolean;
  winnerColor: "R" | "Y" | null;
  isDraw: boolean;
  opponent: ConnectFourOpponent | null;
};

export async function getCurrentConnectFour(token: string) {
  return (await api.get("/api/games/connect-four/current", auth(token))).data as { game: ConnectFourGame | null };
}

export async function joinConnectFour(token: string) {
  return (await api.post("/api/games/connect-four/join", {}, auth(token))).data as { game: ConnectFourGame };
}

export async function playConnectFourMove(token: string, gameId: string, column: number) {
  return (await api.post(`/api/games/connect-four/${gameId}/move`, { column }, auth(token))).data as { game: ConnectFourGame };
}

export async function leaveConnectFour(token: string, gameId: string) {
  return (await api.delete(`/api/games/connect-four/${gameId}/leave`, auth(token))).data as { success: boolean; left: boolean };
}
