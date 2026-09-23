import { CheckCircle2, ChevronDown, ChevronUp, RotateCcw, Save, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../api/client";

export default function AdminTemplates() {
  const [tools, setTools] = useState(null);
  const [open, setOpen] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [msg, setMsg] = useState("");

  const load = () => api("/admin/templates/").then(setTools).catch(() => {});
  useEffect(() => { load(); }, []);

  const toggle = (t) => {
    const key = t.tool_key;
    if (open !== key) {
      setDrafts((d) => ({
        ...d,
        [key]: {
          system_prompt: t.template?.system_prompt ?? t.default_system_prompt,
          user_template: t.template?.user_template ?? t.default_user_template,
          temperature: t.template?.temperature ?? 0.7,
          max_tokens: t.template?.max_tokens ?? 0,
        },
      }));
    }
    setOpen(open === key ? null : key);
  };

  const save = async (toolKey) => {
    await api(`/admin/templates/${toolKey}/`, { method: "PUT", body: drafts[toolKey] });
    setMsg(`Saved new template version for ${toolKey}.`);
    setTimeout(() => setMsg(""), 2500);
    load();
  };

  const reset = async (toolKey) => {
    if (!window.confirm("Reset this tool to its built-in default prompt?")) return;
    await api(`/admin/templates/${toolKey}/`, { method: "DELETE" });
    load();
  };

  if (!tools) {
    return <div className="center" style={{ padding: 80 }}><div className="spinner dark" style={{ width: 32, height: 32, margin: "0 auto" }} /></div>;
  }

  return (
    <div className="fade-in">
      <div className="app-header">
        <div>
          <h1>Prompt templates</h1>
          <div className="sub">
            Tune every assistant's behaviour without a redeploy. Use {"{field_name}"} placeholders matching each tool's inputs.
          </div>
        </div>
      </div>

      {msg && <div className="alert alert-success"><CheckCircle2 size={16} />{msg}</div>}

      <div className="grid" style={{ gap: 12 }}>
        {tools.map((t) => (
          <div className="card" key={t.tool_key} style={{ padding: 0, overflow: "hidden" }}>
            <button
              onClick={() => toggle(t)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: "18px 22px", background: "none", border: 0, textAlign: "left",
              }}
            >
              <Wand2 size={17} color="var(--brand-700)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{t.tool_name}</div>
                <div className="small muted">
                  {t.tool_key} · {t.category === "general" ? "all roles" : (t.roles || []).join(", ")}
                </div>
              </div>
              {t.has_override ? (
                <span className="badge badge-blue">custom v{t.template.version}</span>
              ) : (
                <span className="badge badge-gray">default</span>
              )}
              {open === t.tool_key ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
            </button>

            {open === t.tool_key && drafts[t.tool_key] && (
              <div style={{ padding: "0 22px 22px", borderTop: "1px solid var(--border)" }}>
                <div className="field mt-2">
                  <label>System prompt</label>
                  <textarea
                    rows={5}
                    value={drafts[t.tool_key].system_prompt}
                    onChange={(e) => setDrafts((d) => ({ ...d, [t.tool_key]: { ...d[t.tool_key], system_prompt: e.target.value } }))}
                  />
                </div>
                <div className="field">
                  <label>User template</label>
                  <textarea
                    rows={6}
                    value={drafts[t.tool_key].user_template}
                    onChange={(e) => setDrafts((d) => ({ ...d, [t.tool_key]: { ...d[t.tool_key], user_template: e.target.value } }))}
                  />
                  <div className="hint">Placeholders: {"{field_name}"} — see the tool's input fields.</div>
                </div>
                <div className="grid grid-2">
                  <div className="field">
                    <label>Temperature</label>
                    <input
                      type="number" step="0.1" min="0" max="1"
                      value={drafts[t.tool_key].temperature}
                      onChange={(e) => setDrafts((d) => ({ ...d, [t.tool_key]: { ...d[t.tool_key], temperature: e.target.value } }))}
                    />
                  </div>
                  <div className="field">
                    <label>Max output tokens (0 = default)</label>
                    <input
                      type="number" min="0"
                      value={drafts[t.tool_key].max_tokens}
                      onChange={(e) => setDrafts((d) => ({ ...d, [t.tool_key]: { ...d[t.tool_key], max_tokens: e.target.value } }))}
                    />
                  </div>
                </div>
                <div className="flex">
                  <button className="btn btn-primary btn-sm" onClick={() => save(t.tool_key)}>
                    <Save size={14} /> Save as new version
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => reset(t.tool_key)}>
                    <RotateCcw size={14} /> Reset to default
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
