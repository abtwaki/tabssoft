import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../../api/client";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const uid = params.get("uid") || "";
  const token = params.get("token") || "";
  const [form, setForm] = useState({ new_password: "", confirm: "" });
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const invalidLink = !uid || !token;

  const submit = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api("/auth/password/reset/", {
        method: "POST",
        auth: false,
        body: { uid, token, new_password: form.new_password },
      });
      setDone(true);
    } catch (err) {
      setError(err.message || "Reset failed. The link may have expired — request a new one.");
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
          <h1>Set a new password</h1>
          {invalidLink ? (
            <>
              <div className="alert alert-error">This reset link is incomplete or malformed.</div>
              <p className="auth-alt"><Link to="/forgot-password">Request a new link</Link></p>
            </>
          ) : done ? (
            <>
              <div className="alert alert-success">
                <CheckCircle2 size={17} /> Password updated. You can sign in now.
              </div>
              <p className="auth-alt"><Link to="/login">Go to sign in</Link></p>
            </>
          ) : (
            <>
              <p className="sub">Choose a strong password — at least 8 characters.</p>
              {error && <div className="alert alert-error">{error}</div>}
              <form onSubmit={submit}>
                <div className="field">
                  <label>New password</label>
                  <input
                    type="password" required minLength={8} autoFocus
                    value={form.new_password}
                    onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Confirm new password</label>
                  <input
                    type="password" required minLength={8}
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  />
                </div>
                <button className="btn btn-primary btn-block btn-lg" disabled={busy}>
                  {busy ? <span className="spinner" /> : "Update password"}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
