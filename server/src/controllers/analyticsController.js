const Application = require("../models/Application");
const WorkshopRegistration = require("../models/WorkshopRegistration");
const EventRegistration = require("../models/EventRegistration");
const HackathonRegistration = require("../models/HackathonRegistration");
const Internship = require("../models/Internship");
const Workshop = require("../models/Workshop");
const Event = require("../models/Event");
const Hackathon = require("../models/Hackathon");

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Simple, readable staff analytics — no BI system, just grouped counts.
// GET /api/analytics/staff
async function staffAnalytics(req, res, next) {
  try {
    const [applications, workshopRegs, eventRegs, hackathonRegs] = await Promise.all([
      Application.find().populate("internship", "title"),
      WorkshopRegistration.find(),
      EventRegistration.find(),
      HackathonRegistration.find(),
    ]);

    // Applications by month (last 6 months, oldest first)
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTH_LABELS[d.getMonth()], count: 0 });
    }
    applications.forEach((a) => {
      const d = new Date(a.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = months.find((m) => m.key === key);
      if (bucket) bucket.count += 1;
    });
    const applicationsByMonth = months.map(({ label, count }) => ({ label, count }));

    // Application status breakdown
    const statuses = ["Applied", "Under Review", "Shortlisted", "Selected", "Rejected"];
    const statusBreakdown = statuses.map((status) => ({
      status,
      count: applications.filter((a) => a.status === status).length,
    }));

    // Popular opportunities (by application/registration count), top 5
    const countByInternship = {};
    applications.forEach((a) => {
      if (!a.internship) return;
      const title = a.internship.title;
      countByInternship[title] = (countByInternship[title] || 0) + 1;
    });
    const popularOpportunities = Object.entries(countByInternship)
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Registrations by opportunity type
    const registrationsByType = [
      { type: "Internships", count: applications.length },
      { type: "Workshops", count: workshopRegs.length },
      { type: "Events", count: eventRegs.length },
      { type: "Hackathons", count: hackathonRegs.length },
    ];

    // Organization activity — how many opportunities + registrations each org has
    const [internshipCount, workshopCount, eventCount, hackathonCount] = await Promise.all([
      Internship.countDocuments(),
      Workshop.countDocuments(),
      Event.countDocuments(),
      Hackathon.countDocuments(),
    ]);
    const organizationActivity = [
      {
        organization: "Xentwin Technology",
        opportunities: internshipCount + workshopCount,
        engagement: applications.length + workshopRegs.length,
      },
      {
        organization: "GenAura Technologies",
        opportunities: eventCount + hackathonCount,
        engagement: eventRegs.length + hackathonRegs.length,
      },
    ];

    res.json({
      applicationsByMonth,
      statusBreakdown,
      popularOpportunities,
      registrationsByType,
      organizationActivity,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { staffAnalytics };
