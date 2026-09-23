import { useEffect, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { api } from "../../api/client";

const NGN = (n) => `₦${(n || 0).toLocaleString()}`;

export default function AdminOverview() {
  const [data, setData] = useState(null);
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    api("/admin/overview/").then(setData).catch(() => {});
    api("/admin/usage/").then(setUsage).catch(() => {});
  }, []);

  if (!data) {
    return <div className="center" style={{ padding: 80 }}><div className="spinner dark" style={{ width: 32, height: 32, margin: "0 auto" }} /></div>;
  }

  const tierData = Object.entries(data.subs_by_tier || {}).map(([k, v]) => ({ name: k, count: v }));

  return (
    <div className="fade-in">
      <div className="app-header">
        <div>
          <h1>Overview</h1>
          <div className="sub">Subscribers, revenue and AI usage at a glance.</div>
        </div>
      </div>

      <div className="grid grid-4 stagger mb-3">
        <div className="metric-card">
          <div className="m-label">Active subscribers</div>
          <div className="m-value">{data.active_subscribers}</div>
          <div className="m-sub">{data.total_users} registered users</div>
        </div>
        <div className="metric-card">
          <div className="m-label">Revenue this month</div>
          <div className="m-value">{NGN(data.revenue_this_month_ngn)}</div>
          <div className="m-sub">Successful Paystack charges</div>
        </div>
        <div className="metric-card">
          <div className="m-label">Generations this month</div>
          <div className="m-value">{data.generations_this_month}</div>
          <div className="m-sub">Across all tools</div>
        </div>
        <div className="metric-card">
          <div className="m-label">Blog posts live</div>
          <div className="m-value">{data.posts_published}</div>
          <div className="m-sub">Public insights</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 16 }}>Subscribers by tier</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={tierData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#194C9F" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 16 }}>Generations — last 30 days</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={(usage?.daily || []).map((d) => ({ ...d, day: String(d.day).slice(5) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#53C7EC" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card mt-3">
        <h3 style={{ marginBottom: 14, fontSize: 16 }}>Most-used tools this month</h3>
        {data.top_tools.length === 0 ? (
          <p className="muted small">No generations yet.</p>
        ) : (
          data.top_tools.map((t) => (
            <div key={t.tool_key} className="flex between" style={{ padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
              <span className="small">{t.name}</span>
              <span className="badge badge-blue">{t.n}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
