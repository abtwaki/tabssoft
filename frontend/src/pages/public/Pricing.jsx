import { CheckCircle2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../store/AuthContext";

export default function Pricing() {
  const [plans, setPlans] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api("/billing/plans/", { auth: false }).then(setPlans).catch(() => {});
  }, []);

  const choose = () => {
    navigate(user ? "/app/billing" : "/signup");
  };

  return (
    <>
      <section className="page-head" style={{ background: "var(--bg-soft)" }}>
        <div className="container center">
          <span className="eyebrow" style={{ margin: "0 auto 20px" }}>
            <Sparkles size={14} /> TabsSoft AI Suite
          </span>
          <h1>Priced for Nigeria. Built for the world.</h1>
          <p className="section-lede">
            Every plan includes all general tools and your role workspace.
            Upgrade, downgrade or cancel anytime — pay in Naira with Paystack.
          </p>
        </div>
      </section>

      <section className="section tight">
        <div className="container">
          <div className="grid grid-4 stagger" style={{ alignItems: "stretch" }}>
            {plans.map((p) => (
              <div key={p.slug} className={`card price-card ${p.slug === "pro" ? "featured" : ""}`}>
                {p.slug === "pro" && <span className="flag">MOST POPULAR</span>}
                <div className="plan-name">{p.name}</div>
                <div className="amount">
                  {p.price_ngn === 0 ? "₦0" : `₦${p.price_ngn.toLocaleString()}`}
                </div>
                <div className="per">per month</div>
                <ul>
                  {(p.features || []).map((f) => (
                    <li key={f}><CheckCircle2 size={16} /> {f}</li>
                  ))}
                </ul>
                <button
                  className={`btn btn-block ${p.slug === "pro" ? "btn-primary" : "btn-outline"}`}
                  onClick={choose}
                >
                  {p.price_ngn === 0 ? "Start free" : `Choose ${p.name}`}
                </button>
              </div>
            ))}
          </div>
          <p className="center muted small mt-4">
            Secure payments via Paystack · Quotas reset monthly · NDPR-compliant data handling
          </p>
        </div>
      </section>

      <section className="section tight">
        <div className="container">
          <div className="cta-band">
            <h2>Start with 20 free generations a month.</h2>
            <p>No card required. Upgrade when you outgrow it.</p>
            <div className="hero-actions">
              <Link to="/signup" className="btn btn-accent btn-lg">Create free account</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
