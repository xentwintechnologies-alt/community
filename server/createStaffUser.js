// One-off script to create a staff account (staff can't self-register from
// the UI on purpose — see the comment in authController.js).
//
// Usage:
//   cd server
//   node createStaffUser.js staff@example.com yourPassword123
//
require("dotenv").config();
const dns = require("dns");
// Windows machines sometimes drop the DNS SRV lookup that mongodb+srv://
// URIs rely on (router/ISP quirk). Forcing Google's resolver first makes
// this script's connection much more reliable than the OS default.
dns.setServers(["8.8.8.8", "1.1.1.1", ...dns.getServers()]);
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/models/User");

async function main() {
  const [, , email, password] = process.argv;
  if (!email || !password) {
    console.error("Usage: node createStaffUser.js staff@example.com yourPassword123");
    process.exit(1);
  }
  const name = email.split("@")[0];

  await mongoose.connect(process.env.MONGO_URI);

  const passwordHash = await bcrypt.hash(password, 10);
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    existing.role = "staff";
    existing.passwordHash = passwordHash; // always resync the password too
    await existing.save();
    console.log(`Existing user ${email} promoted to staff and password reset.`);
  } else {
    await User.create({ name, email, passwordHash, role: "staff" });
    console.log(`Staff user created: ${email} (name: ${name})`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});