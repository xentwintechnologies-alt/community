const Message = require("../models/Message");
const Comment = require("../models/Comment");

async function listByChannel(req, res, next) {
  try {
    const messages = await Message.find({ channel: req.params.channelId })
      .populate("sender", "name role")
      .sort({ createdAt: 1 })
      .limit(200);
    res.json(messages);
  } catch (err) { next(err); }
}

// staff moderation - remove an inappropriate post/message (and its replies)
async function remove(req, res, next) {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ message: "Message not found" });
    await Comment.deleteMany({ message: message._id });

    const io = req.app.get("io");
    if (io) io.to(`channel:${message.channel}`).emit("message:deleted", message._id);

    res.json({ message: "Message removed" });
  } catch (err) { next(err); }
}

module.exports = { listByChannel, remove };
