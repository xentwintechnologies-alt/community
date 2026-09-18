const Channel = require("../models/Channel");

async function list(req, res, next) {
  try { res.json(await Channel.find().sort({ name: 1 })); } catch (err) { next(err); }
}

// staff only
async function create(req, res, next) {
  try {
    const { name, description } = req.body;
    const channel = await Channel.create({ name, description });
    res.status(201).json(channel);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Channel already exists" });
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const channel = await Channel.findByIdAndDelete(req.params.id);
    if (!channel) return res.status(404).json({ message: "Channel not found" });
    res.json({ message: "Channel deleted" });
  } catch (err) { next(err); }
}

module.exports = { list, create, remove };
