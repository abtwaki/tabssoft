import {
  BarChart3, CreditCard, FileText, LayoutDashboard, LogOut, Menu,
  Settings as SettingsIcon, Users, Wand2, Newspaper, X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../store/AuthContext";

export default function AppLayout({ admin = false }) {
  const { user, logout } = useAuth();
  const [quota, setQuota] = useState(null);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const refreshQuota = useCallback(() => {
    api("/ai/usage/").then((d) => setQuota(d.quota)).catch(() => {});
  }, []);

  useEffect(() => {
    refreshQuota();
    setOpen(false);
  }, [location.pathname, refreshQuota]);

  const pct = quota ? Math.min(100, Math.round((quota.used / Math.max(1, quota.limit)) * 100)) : 0;

  const nav = admin
    ? [
        { to: "/admin", label: "Overview", icon: BarChart3, end: true },
        { to: "/admin/subscribers", label: "Subscribers", icon: Users },
        { to: "/admin/templates", label: "Prompt templates", icon: Wand2 },
        { to: "/admin/blog", label: "Blog posts", icon: Newspaper },
      ]
    : [
        { to: "/app", label: "Workspace", icon: LayoutDashboard, end: true },
        { to: "/app/documents", label: "My documents", icon: FileText },
        { to: "/app/billing", label: "Billing & plan", icon: CreditCard },
        { to: "/app/settings", label: "Settings", icon: SettingsIcon },
      ];

  return (
    <>
      <div className="mobile-bar">
        <button className="btn btn-ghost btn-sm" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <img src="/assets/logo.jpeg" alt="TabsSoft" />
        <span style={{ fontWeight: 700, fontFamily: "var(--font-display)" }}>AI Suite</span>
      </div>
      <div className="app-shell">
        <aside className={`sidebar ${open ? "open" : ""}`}>
          <Link to="/" className="nav-brand">
            <img src="/assets/logo.jpeg" alt="TabsSoft" />
            <span>AI Suite</span>
          </Link>

          <div className="side-label">{admin ? "Staff admin" : "Menu"}</div>
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className="side-link">
              <n.icon size={18} /> {n.label}
            </NavLink>
          ))}

          {user?.is_staff && !admin && (
            <>
              <div className="side-label">Staff</div>
              <NavLink to="/admin" className="side-link">
                <BarChart3 size={18} /> Admin console
              </NavLink>
            </>
          )}
          {admin && (
            <>
              <div className="side-label">Account</div>
              <NavLink to="/app" className="side-link">
                <LayoutDashboard size={18} /> My workspace
              </NavLink>
            </>
          )}

          {!admin && quota && (
            <div className="side-quota">
              <div className="q-label">
                <span>This month</span>
                <span>
                  {quota.used}/{quota.limit}
                </span>
              </div>
              <div className={`quota-bar ${pct > 85 ? "low" : ""}`}>
                <div style={{ width: `${pct}%` }} />
              </div>
              <Link to="/app/billing" className="small" style={{ display: "inline-block", marginTop: 10 }}>
                {quota.plan === "free" ? "Upgrade for more →" : `${quota.plan} plan →`}
              </Link>
            </div>
          )}

          <button
            className="side-link"
            style={{ border: 0, background: "none", textAlign: "left", marginTop: 8 }}
            onClick={logout}
          >
            <LogOut size={18} /> Sign out
          </button>
        </aside>

        <main className="app-main">
          <Outlet context={{ refreshQuota }} />
        </main>
      </div>
    </>
  );
}
