import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const user = await login(form.email, form.password);
      navigate(user?.is_staff ? "/app" : "/app");
    } catch (err) {
      setError(
        err.status === 401
          ? "Incorrect email or password."
          : err.message || "Sign-in failed. Try again."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <aside className="auth-aside">
        <Link to="/"><img src="/assets/logo.jpeg" alt="TabsSoft" /></Link>
        <div className="quote">
          The workspace where Nigerian professionals meet world-class AI.
        </div>
        <div className="sub">TabsSoft Global Technologies · AI Suite</div>
      </aside>
      <main className="auth-main">
        <div className="auth-card fade-in">
          <h1>Welcome back</h1>
          <p className="sub">Sign in to your AI Suite account.</p>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={submit}>
            <div className="field">
              <label>Email</label>
              <input
                type="email" required autoFocus
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="field">
              <label style={{ display: "flex", justifyContent: "space-between" }}>
                Password
                <Link to="/forgot-password" className="small" style={{ fontWeight: 500 }}>Forgot?</Link>
              </label>
              <input
                type="password" required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button className="btn btn-primary btn-block btn-lg" disabled={busy}>
              {busy ? <span className="spinner" /> : "Sign in"}
            </button>
          </form>
          <p className="auth-alt">
            New here? <Link to="/signup">Create a free account</Link>
          </p>
          <p className="auth-alt"><Link to="/">← Back to tabssoftglobal.com</Link></p>
        </div>
      </main>
    </div>
  );
}
