const Comment = require("../models/Comment");

// GET /api/comments/:messageId
async function listByMessage(req, res, next) {
  try {
    const comments = await Comment.find({ message: req.params.messageId })
      .populate("author", "name role")
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) { next(err); }
}

// POST /api/comments/:messageId - student or staff
async function create(req, res, next) {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: "Comment text is required" });

    const comment = await Comment.create({ message: req.params.messageId, author: req.user._id, text: text.trim() });
    await comment.populate("author", "name role");
    res.status(201).json(comment);
  } catch (err) { next(err); }
}

// DELETE /api/comments/:id - staff (moderation) or the comment's own author
async function remove(req, res, next) {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (req.user.role !== "staff" && comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await comment.deleteOne();
    res.json({ message: "Comment removed" });
  } catch (err) { next(err); }
}

module.exports = { listByMessage, create, remove };
