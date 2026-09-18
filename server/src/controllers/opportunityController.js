const Internship = require("../models/Internship");
const Workshop = require("../models/Workshop");
const Event = require("../models/Event");
const Hackathon = require("../models/Hackathon");

// Normalizes each opportunity type into one common shape so the frontend
// can render a single unified list/search/filter experience, even though
// each type stays its own collection in the database.
function normalize(doc, type) {
  const base = {
    id: doc._id,
    type, // "internship" | "workshop" | "event" | "hackathon"
    title: doc.title || doc.name,
    organization: doc.organization,
    orgLabel: doc.orgLabel,
    description: doc.description,
    mode: doc.mode,
    location: doc.location || null,
    skills: doc.requiredSkills || [],
    createdAt: doc.createdAt,
  };

  if (type === "internship") {
    return { ...base, deadline: doc.deadline, duration: doc.duration, date: null };
  }
  if (type === "workshop") {
    return { ...base, deadline: doc.registrationDeadline, date: doc.date, time: doc.time };
  }
  if (type === "event") {
    return { ...base, deadline: doc.registrationDeadline, date: doc.date, time: doc.time };
  }
  // hackathon
  return { ...base, deadline: doc.registrationDeadline, date: doc.date, teamSize: doc.teamSize };
}

const TYPE_TO_ORG = {
  internship: "Xentwin Technology",
  workshop: "Xentwin Technology",
  event: "GenAura Technologies",
  hackathon: "GenAura Technologies",
};

// GET /api/opportunities?search=&type=all|internship|workshop|event|hackathon&organization=all|Xentwin Technology|GenAura Technologies
async function list(req, res, next) {
  try {
    const { search, type, organization } = req.query;
    const wantedType = type && type !== "all" ? type : null;
    const wantedOrg = organization && organization !== "all" ? organization : null;

    // Skip querying a collection entirely when the type/org filter rules it out —
    // avoids invalid combinations like "Xentwin" + "hackathon".
    const includeInternships = (!wantedType || wantedType === "internship") && (!wantedOrg || wantedOrg === "Xentwin Technology");
    const includeWorkshops = (!wantedType || wantedType === "workshop") && (!wantedOrg || wantedOrg === "Xentwin Technology");
    const includeEvents = (!wantedType || wantedType === "event") && (!wantedOrg || wantedOrg === "GenAura Technologies");
    const includeHackathons = (!wantedType || wantedType === "hackathon") && (!wantedOrg || wantedOrg === "GenAura Technologies");

    const searchFilter = (fields) =>
      search ? { $or: fields.map((f) => ({ [f]: { $regex: search, $options: "i" } })) } : {};

    const [internships, workshops, events, hackathons] = await Promise.all([
      includeInternships
        ? Internship.find(searchFilter(["title", "description", "requiredSkills"])).sort({ createdAt: -1 })
        : [],
      includeWorkshops
        ? Workshop.find(searchFilter(["title", "description"])).sort({ createdAt: -1 })
        : [],
      includeEvents
        ? Event.find(searchFilter(["title", "description"])).sort({ createdAt: -1 })
        : [],
      includeHackathons
        ? Hackathon.find(searchFilter(["name", "description", "theme"])).sort({ createdAt: -1 })
        : [],
    ]);

    const combined = [
      ...internships.map((d) => normalize(d, "internship")),
      ...workshops.map((d) => normalize(d, "workshop")),
      ...events.map((d) => normalize(d, "event")),
      ...hackathons.map((d) => normalize(d, "hackathon")),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(combined);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, TYPE_TO_ORG };