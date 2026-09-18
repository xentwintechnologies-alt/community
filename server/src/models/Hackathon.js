const mongoose = require("mongoose");

const hackathonSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    organization: { type: String, default: "GenAura Technologies", immutable: true },
    orgLabel: { type: String, default: "Organized by GenAura Technologies", immutable: true },
    theme: String,
    description: { type: String, required: true },
    date: { type: Date, required: true },
    registrationDeadline: { type: Date, required: true },
    teamSize: String,
    mode: { type: String, enum: ["Remote", "On-site", "Hybrid"] },
    prizeInfo: String,
    rules: String,
    eligibility: String,
    posterUrl: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hackathon", hackathonSchema);