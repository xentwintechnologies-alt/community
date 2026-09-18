import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import TopBar from "../components/TopBar";

const links = [
  { to: "/student", label: "Dashboard" },
  { to: "/student/profile", label: "Profile" },
  {
    label: "Opportunities",
    children: [
      { to: "/student/opportunities", label: "All Opportunities" },
      { to: "/student/internships", label: "Internships" },
      { to: "/student/workshops", label: "Workshops" },
      { to: "/student/events", label: "Events" },
      { to: "/student/hackathons", label: "Hackathons" },
    ],
  },
  { to: "/student/applications", label: "My Applications" },
  { to: "/student/community", label: "Community" },
  { to: "/student/notifications", label: "Notifications" },
];

export default function StudentLayout() {
  return (
    <div className="portal-layout">
      <Navbar links={links} />
      <div className="portal-body">
        <TopBar />
        <main className="portal-main"><Outlet /></main>
      </div>
    </div>
  );
}