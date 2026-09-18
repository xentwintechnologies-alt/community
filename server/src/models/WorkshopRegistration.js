const mongoose = require("mongoose");

const workshopRegistrationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    workshop: { type: mongoose.Schema.Types.ObjectId, ref: "Workshop", required: true },
  },
  { timestamps: true }
);

workshopRegistrationSchema.index({ student: 1, workshop: 1 }, { unique: true });

module.exports = mongoose.model("WorkshopRegistration", workshopRegistrationSchema);
