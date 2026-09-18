const jwt = require("jsonwebtoken");
const Message = require("../models/Message");

function initSockets(io) {
  // auth handshake: client sends JWT, we attach user info to the socket
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.role = decoded.role;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.userId}`); // personal room for notifications

    socket.on("channel:join", (channelId) => {
      socket.join(`channel:${channelId}`);
    });

    socket.on("channel:leave", (channelId) => {
      socket.leave(`channel:${channelId}`);
    });

    socket.on("message:send", async ({ channelId, text }) => {
      if (!text || !text.trim()) return;
      const message = await Message.create({ channel: channelId, sender: socket.userId, text: text.trim() });
      const populated = await message.populate("sender", "name role");
      io.to(`channel:${channelId}`).emit("message:new", populated);
    });
  });
}

module.exports = initSockets;
