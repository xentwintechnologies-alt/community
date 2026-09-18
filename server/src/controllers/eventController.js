const Event = require("../models/Event");
const EventRegistration = require("../models/EventRegistration");
const { createNotification } = require("../services/notificationService");

async function list(req, res, next) {
  try {
    const { search } = req.query;
    const filter = search ? { title: { $regex: search, $options: "i" } } : {};
    res.json(await Event.find(filter).sort({ date: 1 }));
  } catch (err) { next(err); }
}
async function getOne(req, res, next) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) { next(err); }
}
async function create(req, res, next) {
  try { res.status(201).json(await Event.create({ ...req.body, createdBy: req.user._id })); } catch (err) { next(err); }
}
async function update(req, res, next) {
  try {
    const { organization, orgLabel, ...allowed } = req.body;
    const event = await Event.findByIdAndUpdate(req.params.id, allowed, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) { next(err); }
}
async function remove(req, res, next) {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Event deleted" });
  } catch (err) { next(err); }
}
async function register(req, res, next) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    const reg = await EventRegistration.create({ student: req.user._id, event: event._id });

    await createNotification(
      req.user._id,
      "event_registration",
      `Your registration for ${event.title} is confirmed.`,
      req.app.get("io")
    );

    res.status(201).json(reg);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Already registered for this event" });
    next(err);
  }
}

// student: my event registrations
async function myRegistrations(req, res, next) {
  try {
    const registrations = await EventRegistration.find({ student: req.user._id })
      .populate("event", "title organization orgLabel date time mode location registrationDeadline");
    res.json(registrations);
  } catch (err) { next(err); }
}

// staff: view registrants for an event
async function registrationsFor(req, res, next) {
  try {
    const registrations = await EventRegistration.find({ event: req.params.id })
      .populate("student", "name email university course");
    res.json(registrations);
  } catch (err) { next(err); }
}

module.exports = { list, getOne, create, update, remove, register, myRegistrations, registrationsFor };
