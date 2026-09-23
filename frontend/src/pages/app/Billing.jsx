import { CheckCircle2, CreditCard, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../store/AuthContext";

export default function Billing() {
  const { reload } = useAuth();
  const [plans, setPlans] = useState([]);
  const [sub, setSub] = useState(null);
  const [usage, setUsage] = useState(null);
  const [txns, setTxns] = useState([]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    api("/billing/plans/").then(setPlans).catch(() => {});
    api("/billing/subscription/").then(setSub).catch(() => {});
    api("/ai/usage/").then(setUsage).catch(() => {});
    api("/billing/transactions/").then(setTxns).catch(() => {});
  };
  useEffect(load, []);

  const choose = async (slug) => {
    setBusy(slug);
    setError("");
    try {
      const res = await api("/billing/initialize/", { method: "POST", body: { plan: slug } });
      if (res.free) {
        load();
        reload?.();
      } else if (res.authorization_url) {
        window.location.href = res.authorization_url;
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  };

  const cancel = async () => {
    if (!window.confirm("Cancel at the end of your current period? You keep access until then.")) return;
    try {
      await api("/billing/cancel/", { method: "POST" });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const q = usage?.quota;

  return (
    <div className="fade-in">
      <div className="app-header">
        <div>
          <h1>Billing & plan</h1>
          <div className="sub">Manage your subscription — pay securely with Paystack.</div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {sub && (
        <div className="card mb-3" style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <div className="small muted">Current plan</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700 }}>
              {sub.plan.name}
            </div>
          </div>
          <div>
            <div className="small muted">Status</div>
            <span className={`badge ${sub.status === "active" ? "badge-green" : "badge-amber"}`}>
              {sub.status}{sub.cancel_at_period_end ? " · ends " + new Date(sub.current_period_end).toLocaleDateString() : ""}
            </span>
          </div>
          {q && (
            <div>
              <div className="small muted">Usage this month</div>
              <div style={{ fontWeight: 700 }}>{q.used} / {q.limit} generations</div>
            </div>
          )}
          {sub.plan.price_ngn > 0 && !sub.cancel_at_period_end && (
            <button className="btn btn-danger btn-sm" style={{ marginLeft: "auto" }} onClick={cancel}>
              Cancel subscription
            </button>
          )}
        </div>
      )}

      <div className="grid grid-4 stagger" style={{ alignItems: "stretch" }}>
        {plans.map((p) => {
          const current = sub?.plan?.slug === p.slug;
          return (
            <div key={p.slug} className={`card price-card ${current ? "featured" : ""}`}>
              {current && <span className="flag">CURRENT</span>}
              <div className="plan-name">{p.name}</div>
              <div className="amount">{p.price_ngn === 0 ? "₦0" : `₦${p.price_ngn.toLocaleString()}`}</div>
              <div className="per">per month · {p.monthly_quota.toLocaleString()} generations</div>
              <ul>
                {(p.features || []).map((f) => <li key={f}><CheckCircle2 size={16} /> {f}</li>)}
              </ul>
              <button
                className={`btn btn-block ${current ? "btn-ghost" : "btn-primary"}`}
                disabled={current || busy === p.slug}
                onClick={() => choose(p.slug)}
              >
                {busy === p.slug ? <span className="spinner" /> : current ? "Current plan" : p.price_ngn === 0 ? "Switch to Free" : `Upgrade to ${p.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {txns.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2" style={{ fontSize: 18 }}>Payment history</h3>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr><th>Reference</th><th>Plan</th><th>Amount</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {txns.map((t) => (
                  <tr key={t.reference}>
                    <td style={{ fontFamily: "monospace", fontSize: 12.5 }}>{t.reference}</td>
                    <td>{t.plan_name}</td>
                    <td>₦{t.amount_ngn.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${t.status === "success" ? "badge-green" : t.status === "pending" ? "badge-amber" : "badge-red"}`}>
                        {t.status}
                      </span>
                    </td>
                    <td>{new Date(t.created_at).toLocaleDateString("en-NG")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card mt-4 flex" style={{ gap: 12 }}>
        <CreditCard size={18} color="var(--brand-700)" />
        <div className="small muted">
          Payments processed by Paystack. Checkout opens in a secure window and returns here automatically.
          <ExternalLink size={12} style={{ display: "inline", marginLeft: 4 }} />
        </div>
      </div>
    </div>
  );
}
