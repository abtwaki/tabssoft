import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../store/AuthContext";

const ROLES = [
  { value: "general", label: "General / Personal use" },
  { value: "civil_servant", label: "Civil Servant" },
  { value: "teacher", label: "Teacher" },
  { value: "student", label: "Student" },
  { value: "business_owner", label: "Business Owner" },
  { value: "gospel_minister", label: "Gospel Minister / Pastor" },
  { value: "lecturer", label: "Lecturer" },
];

export default function Settings() {
  const { user, reload, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    role: user?.role || "general",
    organization: user?.organization || "",
    phone: user?.phone || "",
  });
  const [saved, setSaved] = useState(false);
  const [pw, setPw] = useState("");
  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [error, setError] = useState("");
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    api("/ai/usage/").then(setUsage).catch(() => {});
  }, []);

  const save = async (e) => {
    e.preventDefault();
    await api("/auth/me/", { method: "PATCH", body: form });
    setSaved(true);
    reload?.();
    setTimeout(() => setSaved(false), 2200);
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwErr("");
    setPwMsg("");
    if (pwForm.new_password !== pwForm.confirm) {
      setPwErr("New passwords don't match.");
      return;
    }
    try {
      await api("/auth/password/change/", {
        method: "POST",
        body: { current_password: pwForm.current_password, new_password: pwForm.new_password },
      });
      setPwMsg("Password updated.");
      setPwForm({ current_password: "", new_password: "", confirm: "" });
    } catch (err) {
      setPwErr(err.data?.current_password?.[0] || err.message);
    }
  };

  const deleteAccount = async () => {
    if (!pw) {
      setError("Enter your password to confirm deletion.");
      return;
    }
    if (!window.confirm("Permanently delete your account and all data? This cannot be undone.")) return;
    try {
      await api("/auth/me/", { method: "DELETE", body: { password: pw } });
      logout();
      navigate("/");
    } catch (e) {
      setError(e.message);
    }
  };

  const byTool = usage?.by_tool || {};

  return (
    <div className="fade-in" style={{ maxWidth: 720 }}>
      <div className="app-header">
        <div>
          <h1>Settings</h1>
          <div className="sub">Profile, usage and account controls.</div>
        </div>
      </div>

      <div className="card mb-3">
        <h3 style={{ marginBottom: 18 }}>Profile</h3>
        {saved && <div className="alert alert-success"><CheckCircle2 size={16} /> Saved.</div>}
        <form onSubmit={save}>
          <div className="grid grid-2">
            <div className="field">
              <label>Full name</label>
              <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div className="field">
              <label>Email</label>
              <input value={user?.email} disabled style={{ opacity: 0.6 }} />
            </div>
          </div>
          <div className="grid grid-2">
            <div className="field">
              <label>Workspace role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              <div className="hint">Switching roles changes which workspace tools you see.</div>
            </div>
            <div className="field">
              <label>Organisation</label>
              <input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
            </div>
          </div>
          <button className="btn btn-primary">Save changes</button>
        </form>
      </div>

      <div className="card mb-3">
        <h3 style={{ marginBottom: 18 }}>Change password</h3>
        {pwMsg && <div className="alert alert-success"><CheckCircle2 size={16} /> {pwMsg}</div>}
        {pwErr && <div className="alert alert-error">{pwErr}</div>}
        <form onSubmit={changePassword}>
          <div className="grid grid-3">
            <div className="field">
              <label>Current password</label>
              <input type="password" required value={pwForm.current_password}
                onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })} />
            </div>
            <div className="field">
              <label>New password</label>
              <input type="password" required minLength={8} value={pwForm.new_password}
                onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })} />
            </div>
            <div className="field">
              <label>Confirm new password</label>
              <input type="password" required minLength={8} value={pwForm.confirm}
                onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} />
            </div>
          </div>
          <button className="btn btn-outline">Update password</button>
        </form>
      </div>

      {Object.keys(byTool).length > 0 && (
        <div className="card mb-3">
          <h3 style={{ marginBottom: 14 }}>Your usage — {usage.month}</h3>
          {Object.entries(byTool).map(([key, t]) => (
            <div key={key} className="flex between" style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <span className="small">{t.name || key}</span>
              <span className="badge badge-blue">{t.count} generations</span>
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ borderColor: "#f2c4c4" }}>
        <h3 style={{ marginBottom: 8, color: "var(--danger)" }}>
          <AlertTriangle size={17} style={{ verticalAlign: "-3px" }} /> Delete account
        </h3>
        <p className="small muted mb-2">
          NDPR right to erasure — this permanently deletes your account, saved
          documents, and usage history. Active subscriptions are cancelled.
        </p>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="flex">
          <input
            type="password"
            placeholder="Confirm with your password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            style={{ flex: 1, padding: "11px 14px", border: "1px solid var(--border-strong)", borderRadius: 10 }}
          />
          <button className="btn btn-danger" onClick={deleteAccount}>Delete permanently</button>
        </div>
      </div>
    </div>
  );
}
