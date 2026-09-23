import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "", email: "", password: "", role: "general",
    organization: "", consent: false,
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) =>
    setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.consent) {
      setError("Please accept the privacy policy to continue.");
      return;
    }
    setBusy(true);
    try {
      await register(form);
      navigate("/app");
    } catch (err) {
      const d = err.data || {};
      const first =
        d.email?.[0] || d.password?.[0] || d.consent?.[0] || err.message;
      setError(first || "Sign-up failed. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <aside className="auth-aside">
        <Link to="/"><img src="/assets/logo.jpeg" alt="TabsSoft" /></Link>
        <div className="quote">
          Twenty free AI generations every month. Your workspace is waiting.
        </div>
        <div className="sub">No card required · Cancel anytime · NDPR compliant</div>
      </aside>
      <main className="auth-main">
        <div className="auth-card fade-in">
          <h1>Create your account</h1>
          <p className="sub">Pick the role that fits — we'll tune your workspace to it.</p>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={submit}>
            <div className="field">
              <label>Full name <span className="req">*</span></label>
              <input required value={form.full_name} onChange={set("full_name")} />
            </div>
            <div className="field">
              <label>Email <span className="req">*</span></label>
              <input type="email" required value={form.email} onChange={set("email")} />
            </div>
            <div className="grid grid-2">
              <div className="field">
                <label>Password <span className="req">*</span></label>
                <input type="password" required minLength={8} value={form.password} onChange={set("password")} />
                <div className="hint">At least 8 characters</div>
              </div>
              <div className="field">
                <label>I am a… <span className="req">*</span></label>
                <select value={form.role} onChange={set("role")}>
                  {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>
            <div className="field">
              <label>Organisation (optional)</label>
              <input value={form.organization} onChange={set("organization")} placeholder="e.g. Federal Ministry of…" />
            </div>
            <div className="field">
              <label className="checkbox-row">
                <input type="checkbox" checked={form.consent} onChange={set("consent")} />
                <span>
                  I consent to TabsSoft processing my data as described in the{" "}
                  <Link to="/privacy">Privacy Policy</Link> (NDPR). I can delete my
                  account and data anytime.
                </span>
              </label>
            </div>
            <button className="btn btn-primary btn-block btn-lg" disabled={busy}>
              {busy ? <span className="spinner" /> : "Create free account"}
            </button>
          </form>
          <p className="auth-alt">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
