const mongoose = require("mongoose");

// A basic reply on a community message/post — deliberately simple (no
// nested replies, no reactions) per the V1 community scope reduction.
const commentSchema = new mongoose.Schema(
  {
    message: { type: mongoose.Schema.Types.ObjectId, ref: "Message", required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
