const mongoose = require("mongoose");

const workshopSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    organization: { type: String, default: "Xentwin Technology", immutable: true },
    orgLabel: { type: String, default: "Conducted by Xentwin Technology", immutable: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    time: String,
    instructor: String,
    mode: { type: String, enum: ["Remote", "On-site", "Hybrid"] },
    seats: Number,
    registrationDeadline: { type: Date, required: true },
    posterUrl: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workshop", workshopSchema);