import { ArrowRight, Info } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import Icon from "../../components/Icon";
import { useAuth } from "../../store/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("general");

  useEffect(() => {
    api("/ai/tools/").then(setData).catch((e) => setError(e.message));
  }, []);

  const tools = useMemo(() => {
    if (!data) return [];
    if (tab === "general") return data.tools.filter((t) => t.category === "general");
    return data.tools.filter((t) => t.category === "role");
  }, [data, tab]);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) {
    return <div className="center" style={{ padding: 80 }}><div className="spinner dark" style={{ width: 32, height: 32, margin: "0 auto" }} /></div>;
  }

  const { quota, workspaces } = data;
  const roleWs = workspaces.find((w) => w.role !== "general");

  return (
    <div className="fade-in">
      <div className="app-header">
        <div>
          <h1>Welcome{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}</h1>
          <div className="sub">
            {quota.remaining} of {quota.limit} generations left this month ·{" "}
            <span style={{ textTransform: "capitalize" }}>{quota.plan}</span> plan
          </div>
        </div>
        <Link to="/app/billing" className="btn btn-outline btn-sm" style={{ marginLeft: "auto" }}>
          Manage plan
        </Link>
      </div>

      {quota.remaining <= 0 && (
        <div className="alert alert-warning">
          <Info size={17} />
          <div>
            You've used all {quota.limit} generations this month.{" "}
            <Link to="/app/billing">Upgrade your plan</Link> to keep going.
          </div>
        </div>
      )}

      <div className="admin-tabs">
        {workspaces.map((w) => (
          <a
            key={w.role}
            href="#"
            className={tab === w.role ? "active" : ""}
            onClick={(e) => { e.preventDefault(); setTab(w.role); }}
          >
            {w.label}
          </a>
        ))}
      </div>

      {tab !== "general" && roleWs && (
        <p className="muted small mb-2">
          Tools tuned for the <strong>{roleWs.label}</strong> workspace.
        </p>
      )}

      <div className="grid grid-3 stagger">
        {tools.map((t) => (
          <Link to={`/app/tools/${t.key}`} key={t.key} className="card tool-card" style={{ color: "inherit" }}>
            <div className="tool-name">
              <span className="card-icon" style={{ margin: 0, width: 38, height: 38 }}>
                <Icon name={t.icon} size={18} />
              </span>
              {t.name}
            </div>
            <div className="tool-desc">{t.description}</div>
            <span className="go">Open tool <ArrowRight size={14} /></span>
          </Link>
        ))}
      </div>

      {tools.length === 0 && (
        <div className="card center muted" style={{ padding: 40 }}>
          No tools in this workspace for your role.
        </div>
      )}
    </div>
  );
}
