import { io, Socket } from "socket.io-client";

import { API_URL } from "../api/client";

let socket: Socket | null = null;

export function connectSocket(token: string) {
  if (socket) {
    if (!socket.connected) {
      socket.connect();
    }

    return socket;
  }

  socket = io(API_URL, {
    transports: ["websocket"],
    autoConnect: true,
    auth: {
      token,
    },
  });

  socket.on("connect", () => {
    console.log("🔌 Socket connected:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("❌ SOCKET ERROR:", error.message);
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
