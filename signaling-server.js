// signaling-server.js
const io = require("socket.io")(4000, {
    cors: {
      origin: "*", // Allow all origins for simplicity
    },
  });
  
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
  
    socket.on("offer", (data) => {
      socket.broadcast.emit("offer", data);
    });
  
    socket.on("answer", (data) => {
      socket.broadcast.emit("answer", data);
    });
  
    socket.on("candidate", (data) => {
      socket.broadcast.emit("candidate", data);
    });
  
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
  