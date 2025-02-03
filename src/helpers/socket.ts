import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL, {
  transports: ["websocket"], // Usamos WebSockets directamente para evitar polling innecesario
});

export default socket;
