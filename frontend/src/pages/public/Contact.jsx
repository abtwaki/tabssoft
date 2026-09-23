import { CheckCircle2, Mail, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { api } from "../../api/client";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState({ state: "idle", msg: "" });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ state: "sending", msg: "" });
    try {
      await api("/contact/", { method: "POST", auth: false, body: form });
      setStatus({ state: "done", msg: "Message sent. We'll be in touch shortly." });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus({ state: "error", msg: err.message || "Could not send. Try again." });
    }
  };

  return (
    <>
      <section className="page-head" style={{ background: "var(--bg-soft)" }}>
        <div className="container">
          <span className="eyebrow">Contact</span>
          <h1>Let's talk.</h1>
          <p>A project, a partnership, a question about the AI Suite — we read everything.</p>
        </div>
      </section>

      <section className="section tight">
        <div className="container split" style={{ alignItems: "start" }}>
          <div>
            <div className="card" style={{ marginBottom: 18 }}>
              <div className="card-icon"><Mail size={20} /></div>
              <h3 style={{ fontSize: 16 }}>Email</h3>
              <p><a href="mailto:info@tabssoftglobal.com">info@tabssoftglobal.com</a></p>
            </div>
            <div className="card">
              <div className="card-icon"><MapPin size={20} /></div>
              <h3 style={{ fontSize: 16 }}>Office</h3>
              <p>Minna, Niger State, Nigeria</p>
            </div>
          </div>

          <div className="card" style={{ padding: 34 }}>
            {status.state === "done" ? (
              <div className="center" style={{ padding: "40px 0" }}>
                <CheckCircle2 size={46} color="var(--success)" style={{ margin: "0 auto 16px" }} />
                <h3>Message sent</h3>
                <p className="muted mt-1">Thanks — the TabsSoft team will reply shortly.</p>
              </div>
            ) : (
              <form onSubmit={submit}>
                {status.state === "error" && <div className="alert alert-error">{status.msg}</div>}
                <div className="grid grid-2">
                  <div className="field">
                    <label>Your name <span className="req">*</span></label>
                    <input required value={form.name} onChange={set("name")} />
                  </div>
                  <div className="field">
                    <label>Email <span className="req">*</span></label>
                    <input required type="email" value={form.email} onChange={set("email")} />
                  </div>
                </div>
                <div className="field">
                  <label>Subject <span className="req">*</span></label>
                  <input required value={form.subject} onChange={set("subject")} />
                </div>
                <div className="field">
                  <label>Message <span className="req">*</span></label>
                  <textarea required rows={6} value={form.message} onChange={set("message")} />
                </div>
                <button className="btn btn-primary" disabled={status.state === "sending"}>
                  {status.state === "sending" ? <span className="spinner" /> : <Send size={16} />}
                  {status.state === "sending" ? "Sending…" : "Send message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
