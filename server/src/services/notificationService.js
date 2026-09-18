const Notification = require("../models/Notification");

async function createNotification(userId, type, message, io) {
  const notification = await Notification.create({ user: userId, type, message });
  if (io) io.to(`user:${userId}`).emit("notification:new", notification);
  return notification;
}

module.exports = { createNotification };
