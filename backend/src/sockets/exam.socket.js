export const setupSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);

    socket.on("ANSWER_UPDATE", (data) => {
      console.log("📩 Answer Update:", data);

      socket.broadcast.emit("LIVE_UPDATE", data);
    });

    socket.on("disconnect", () => {
      console.log("🔴 User disconnected");
    });
  });
};