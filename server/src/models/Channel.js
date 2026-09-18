const mongoose = require("mongoose");

const channelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // e.g. "general"
    description: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Channel", channelSchema);
