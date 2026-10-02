import { CheckCircle2, Edit3, LayoutTemplate } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import RichEditor from "../../components/RichEditor";

export default function AdminContent() {
  const [blocks, setBlocks] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", content: "" });
  const [msg, setMsg] = useState("");

  const load = () => api("/admin/content/").then(setBlocks).catch(() => setBlocks([]));
  useEffect(() => { load(); }, []);

  const startEdit = (block) => {
    setEditing(block.key);
    setForm({ title: block.title, content: block.content });
  };

  const save = async (e) => {
    e.preventDefault();
    await api(`/admin/content/${editing}/`, { method: "PATCH", body: form });
    setMsg("Saved — live on the public site.");
    setEditing(null);
    load();
    setTimeout(() => setMsg(""), 2200);
  };

  if (editing) {
    return (
      <div className="fade-in" style={{ maxWidth: 860 }}>
        <div className="app-header">
          <div>
            <h1>Edit “{editing}”</h1>
            <div className="sub">This block renders on the public site where the key is referenced.</div>
          </div>
        </div>
        <form onSubmit={save} className="card">
          <div className="field">
            <label>Title</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="field">
            <label>Content</label>
            <RichEditor value={form.content} onChange={(html) => setForm({ ...form, content: html })} />
          </div>
          <div className="flex" style={{ justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn btn-primary"><CheckCircle2 size={15} /> Save block</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="app-header">
        <div>
          <h1>Site content</h1>
          <div className="sub">Editable copy blocks used across the public website.</div>
        </div>
      </div>

      {msg && <div className="alert alert-success"><CheckCircle2 size={16} />{msg}</div>}

      {blocks === null ? (
        <div className="center" style={{ padding: 60 }}><div className="spinner dark" style={{ width: 30, height: 30, margin: "0 auto" }} /></div>
      ) : blocks.length === 0 ? (
        <div className="card center muted" style={{ padding: 50 }}>
          <LayoutTemplate size={36} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
          No content blocks seeded yet.
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>Key</th><th>Title</th><th>Preview</th><th>Updated</th><th></th></tr></thead>
            <tbody>
              {blocks.map((b) => (
                <tr key={b.key}>
                  <td><code className="small">{b.key}</code></td>
                  <td style={{ fontWeight: 600 }}>{b.title}</td>
                  <td className="small muted" style={{ maxWidth: 320 }}>
                    {(b.content || "").replace(/<[^>]+>/g, "").slice(0, 90)}…
                  </td>
                  <td className="small">{b.updated_at ? new Date(b.updated_at).toLocaleDateString("en-NG") : "—"}</td>
                  <td>
                    <div className="flex" style={{ justifyContent: "flex-end" }}>
                      <button className="icon-btn" onClick={() => startEdit(b)}><Edit3 size={14} /> Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
