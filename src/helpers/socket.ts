import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL, {
  transports: ["websocket"], // We use WebSockets directly to avoid unnecessary polling
});

export default socket;
