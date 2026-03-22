import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

let socket = null; // ✅ GLOBAL SINGLETON

const useSocket = (onMessage) => {
  const initialized = useRef(false);

  useEffect(() => {
    if (!socket) {
      socket = io("http://localhost:8000", {
        withCredentials: true,
        transports: ["websocket"],
      });
    }

    if (!initialized.current) {
      socket.on("message", onMessage);
      initialized.current = true;
    }

    return () => {
      socket.off("message", onMessage);
      // ❌ DO NOT disconnect here
    };
  }, [onMessage]);

  const sendMessage = (data) => {
    if (socket) {
      socket.emit("message", data);
    }
  };

  return { sendMessage };
};

export default useSocket;