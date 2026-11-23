import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../store/auth.store";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3007";

let socket: Socket | null = null;

export const getSocket = (): Socket | null => {
  return socket;
};

export const initSocket = (): Socket | null => {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    return null;
  }

  if (socket && socket.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });

  socket.on("connect", () => {
    console.log("[Socket.IO] Connected to backend gateway:", socket?.id);
  });

  socket.on("connected", (data) => {
    console.log("[Socket.IO] Handshake confirmed:", data);
  });

  socket.on("connect_error", (error) => {
    console.error("[Socket.IO] Connection error:", error.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("[Socket.IO] Disconnected:", reason);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

