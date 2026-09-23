import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { api } from "../../api/client";

export default function AdminSubscribers() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [plans, setPlans] = useState([]);
  const [msg, setMsg] = useState("");

  const load = useCallback((q = search, page = 1) => {
    api(`/admin/subscribers/?search=${encodeURIComponent(q)}&page=${page}`)
      .then(setData)
      .catch(() => {});
  }, [search]);

  useEffect(() => {
    load("");
    api("/billing/plans/").then(setPlans).catch(() => {});
  }, []); // eslint-disable-line

  const setPlan = async (userId, plan) => {
    await api(`/admin/subscribers/${userId}/`, { method: "PATCH", body: { plan } });
    setMsg(`Updated to ${plan}.`);
    setTimeout(() => setMsg(""), 2500);
    load();
  };

  const setStatus = async (userId, status) => {
    await api(`/admin/subscribers/${userId}/`, { method: "PATCH", body: { status } });
    load();
  };

  return (
    <div className="fade-in">
      <div className="app-header">
        <div>
          <h1>Subscribers</h1>
          <div className="sub">{data?.count ?? "…"} registered accounts</div>
        </div>
        <div className="flex" style={{ marginLeft: "auto" }}>
          <input
            placeholder="Search email or name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            style={{ padding: "10px 14px", border: "1px solid var(--border-strong)", borderRadius: 10, minWidth: 240 }}
          />
          <button className="btn btn-outline btn-sm" onClick={() => load()}><Search size={15} /></button>
        </div>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>User</th><th>Role</th><th>Plan</th><th>Status</th><th>Usage</th><th>Change plan</th>
            </tr>
          </thead>
          <tbody>
            {(data?.results || []).map((u) => (
              <tr key={u.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{u.full_name || "—"}</div>
                  <div className="small muted">{u.email}{u.is_staff ? " · staff" : ""}</div>
                </td>
                <td className="small" style={{ textTransform: "capitalize" }}>{u.role.replace("_", " ")}</td>
                <td><span className="badge badge-blue">{u.plan_name || "—"}</span></td>
                <td>
                  <span className={`badge ${u.status === "active" ? "badge-green" : "badge-gray"}`}>
                    {u.status || "none"}
                  </span>
                </td>
                <td className="small">{u.used_this_month}/{u.quota}</td>
                <td>
                  <div className="flex">
                    <select
                      value={u.plan || ""}
                      onChange={(e) => e.target.value && setPlan(u.id, e.target.value)}
                      style={{ padding: "7px 10px", border: "1px solid var(--border-strong)", borderRadius: 8, fontSize: 13 }}
                    >
                      <option value="">Set plan…</option>
                      {plans.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
                    </select>
                    {u.status === "active" ? (
                      <button className="icon-btn" onClick={() => setStatus(u.id, "cancelled")}>Suspend</button>
                    ) : (
                      <button className="icon-btn" onClick={() => setStatus(u.id, "active")}>Activate</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
