import { useEffect, useState } from "react";
import { apiRequest, uploadFile } from "../../services/api";

const empty = { name: "", theme: "", description: "", date: "", teamSize: "", mode: "Online", prizeInfo: "", rules: "", eligibility: "", registrationDeadline: "", posterUrl: "" };

export default function StaffHackathons() {
  const [hackathons, setHackathons] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [viewingRegsFor, setViewingRegsFor] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [posterError, setPosterError] = useState("");

  function load() {
    apiRequest("/hackathons").then(setHackathons);
  }
  useEffect(load, []);

  async function handlePosterChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPosterError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("poster", file);
      const { posterUrl } = await uploadFile("/upload/poster", fd);
      setForm((f) => ({ ...f, posterUrl }));
    } catch (err) {
      setPosterError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editingId) {
      await apiRequest(`/hackathons/${editingId}`, { method: "PUT", body: JSON.stringify(form) });
    } else {
      await apiRequest("/hackathons", { method: "POST", body: JSON.stringify(form) });
    }
    setForm(empty);
    setEditingId(null);
    load();
  }

  function edit(h) {
    setEditingId(h._id);
    setForm({
      name: h.name, theme: h.theme || "", description: h.description, date: h.date?.slice(0, 10),
      teamSize: h.teamSize || "", mode: h.mode || "Online", prizeInfo: h.prizeInfo || "",
      rules: h.rules || "", eligibility: h.eligibility || "", registrationDeadline: h.registrationDeadline?.slice(0, 10),
      posterUrl: h.posterUrl || "",
    });
  }

  async function remove(id) {
    await apiRequest(`/hackathons/${id}`, { method: "DELETE" });
    load();
  }

  async function viewRegistrations(id) {
    setViewingRegsFor(id);
    const regs = await apiRequest(`/hackathons/${id}/registrations`);
    setRegistrations(regs);
  }

  return (
    <div>
      <h1>Manage Hackathons</h1>
      <form onSubmit={handleSubmit} className="inline-form">
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Theme" value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        <input placeholder="Team size (e.g. 2-4)" value={form.teamSize} onChange={(e) => setForm({ ...form, teamSize: e.target.value })} />
        <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
          <option value="Remote">Remote</option>
          <option value="On-site">On-site</option>
          <option value="Hybrid">Hybrid</option>
        </select>
        <input placeholder="Prize info" value={form.prizeInfo} onChange={(e) => setForm({ ...form, prizeInfo: e.target.value })} />
        <input type="date" value={form.registrationDeadline} onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })} required />

        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12.5 }}>
          Poster image
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePosterChange} />
        </label>

        <button type="submit" disabled={uploading}>{editingId ? "Update" : "Create"}</button>
      </form>

      {uploading && <p className="muted-text">Uploading poster…</p>}
      {posterError && <p className="error-text">{posterError}</p>}
      {form.posterUrl && (
        <div style={{ marginBottom: 18 }}>
          <img src={form.posterUrl} alt="Poster preview" style={{ maxWidth: 240, borderRadius: 12, border: "1px solid var(--border)" }} />
          <button type="button" className="link-btn" style={{ display: "block", marginTop: 6 }} onClick={() => setForm({ ...form, posterUrl: "" })}>Remove poster</button>
        </div>
      )}

      <table>
        <thead><tr><th>Poster</th><th>Name</th><th>Org</th><th>Date</th><th>Deadline</th><th>Actions</th></tr></thead>
        <tbody>
          {hackathons.map((h) => (
            <tr key={h._id}>
              <td data-label="Poster">{h.posterUrl ? <img src={h.posterUrl} alt="" style={{ width: 56, height: 34, objectFit: "cover", borderRadius: 6 }} /> : "-"}</td>
              <td data-label="Name">{h.name}</td>
              <td data-label="Org">{h.orgLabel}</td>
              <td data-label="Date">{new Date(h.date).toLocaleDateString()}</td>
              <td data-label="Deadline">{new Date(h.registrationDeadline).toLocaleDateString()}</td>
              <td data-label="Actions">
                <button onClick={() => edit(h)}>Edit</button>
                <button onClick={() => remove(h._id)}>Delete</button>
                <button onClick={() => viewRegistrations(h._id)}>Registrations</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {viewingRegsFor && (
        <div className="panel">
          <h2>Registrations <button className="link-btn" onClick={() => setViewingRegsFor(null)}>Close</button></h2>
          {registrations.length === 0 ? (
            <p>No registrations yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Student</th><th>Team</th><th>Leader</th><th>Email</th><th>Phone</th>
                  <th>Members</th><th>College</th><th>Project</th><th>GitHub</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((r) => (
                  <tr key={r._id}>
                    <td data-label="Student">{r.student?.name}</td>
                    <td data-label="Team">{r.teamName || "-"}</td>
                    <td data-label="Leader">{r.leaderName || "-"}</td>
                    <td data-label="Email">{r.leaderEmail || r.student?.email}</td>
                    <td data-label="Phone">{r.phone || "-"}</td>
                    <td data-label="Members">{r.teamMembers || "-"}</td>
                    <td data-label="College">{r.college || "-"}</td>
                    <td data-label="Project">{r.projectTitle || "-"}</td>
                    <td data-label="GitHub">
                      {r.githubLink ? <a href={r.githubLink} target="_blank" rel="noreferrer">Link</a> : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}