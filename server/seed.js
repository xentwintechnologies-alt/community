
require("dotenv").config();
const mongoose = require("mongoose");
const Channel = require("./src/models/Channel");

const channels = [
  "general", "announcements", "internships", "events",
  "hackathons", "workshops", "ai-ml", "web-development",
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  for (const name of channels) {
    await Channel.findOneAndUpdate({ name }, { name }, { upsert: true });
  }
  console.log("Channels seeded:", channels.join(", "));
  await mongoose.disconnect();
}

seed();