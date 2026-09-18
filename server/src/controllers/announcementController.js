const Announcement = require("../models/Announcement");
const User = require("../models/User");
const { createNotification } = require("../services/notificationService");

async function list(req, res, next) {
  try {
    res.json(await Announcement.find().sort({ createdAt: -1 }));
  } catch (err) { next(err); }
}

// staff only - notifies every student
async function create(req, res, next) {
  try {
    const { title, body } = req.body;
    const announcement = await Announcement.create({ title, body, createdBy: req.user._id });

    const students = await User.find({ role: "student" }).select("_id");
    const io = req.app.get("io");
    await Promise.all(
      students.map((s) => createNotification(s._id, "announcement", title, io))
    );

    res.status(201).json(announcement);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });
    res.json({ message: "Announcement deleted" });
  } catch (err) { next(err); }
}

module.exports = { list, create, remove };
