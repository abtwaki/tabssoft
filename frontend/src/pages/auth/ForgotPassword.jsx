import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/auth/password/forgot/", { method: "POST", auth: false, body: { email } });
      setSent(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
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
          <h1>Reset your password</h1>
          <p className="sub">Enter your account email and we'll send a reset link.</p>
          {sent ? (
            <div className="alert alert-success">
              <CheckCircle2 size={17} />
              If that email is registered, a reset link is on its way. Check your inbox (and spam).
            </div>
          ) : (
            <>
              {error && <div className="alert alert-error">{error}</div>}
              <form onSubmit={submit}>
                <div className="field">
                  <label>Email</label>
                  <input
                    type="email" required autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button className="btn btn-primary btn-block btn-lg" disabled={busy}>
                  {busy ? <span className="spinner" /> : "Send reset link"}
                </button>
              </form>
            </>
          )}
          <p className="auth-alt"><Link to="/login">← Back to sign in</Link></p>
        </div>
      </main>
    </div>
  );
}
