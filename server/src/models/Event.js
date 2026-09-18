const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    organization: { type: String, default: "GenAura Technologies", immutable: true },
    orgLabel: { type: String, default: "Organized by GenAura Technologies", immutable: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    time: String,
    location: String,
    mode: { type: String, enum: ["Remote", "On-site", "Hybrid"] },
    capacity: Number,
    registrationDeadline: { type: Date, required: true },
    posterUrl: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);