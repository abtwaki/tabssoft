import { Copy, FileText, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../api/client";

export default function Documents() {
  const [docs, setDocs] = useState(null);
  const [open, setOpen] = useState(null);

  const load = () => api("/ai/documents/").then(setDocs).catch(() => setDocs([]));
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this document?")) return;
    await api(`/ai/documents/${id}/`, { method: "DELETE" });
    setDocs((d) => d.filter((x) => x.id !== id));
    if (open?.id === id) setOpen(null);
  };

  const copy = (text) => navigator.clipboard.writeText(text).catch(() => {});

  if (docs === null) {
    return <div className="center" style={{ padding: 80 }}><div className="spinner dark" style={{ width: 32, height: 32, margin: "0 auto" }} /></div>;
  }

  return (
    <div className="fade-in">
      <div className="app-header">
        <div>
          <h1>My documents</h1>
          <div className="sub">Saved outputs — encrypted at rest, only visible to you.</div>
        </div>
      </div>

      {docs.length === 0 ? (
        <div className="card center muted" style={{ padding: 60 }}>
          <FileText size={40} style={{ margin: "0 auto 14px", opacity: 0.4 }} />
          Nothing saved yet. Generate something and hit “Save”.
        </div>
      ) : (
        <div className="grid" style={{ gap: 14 }}>
          {docs.map((d) => (
            <div className="card" key={d.id} style={{ padding: 20 }}>
              <div className="flex between wrap">
                <div>
                  <div style={{ fontWeight: 600 }}>{d.title}</div>
                  <div className="small muted">
                    {d.tool_key} · {new Date(d.updated_at).toLocaleString("en-NG")}
                  </div>
                </div>
                <div className="flex">
                  <button className="icon-btn" onClick={() => setOpen(open?.id === d.id ? null : d)}>
                    {open?.id === d.id ? "Hide" : "View"}
                  </button>
                  <button className="icon-btn" onClick={() => copy(d.content)}><Copy size={14} /> Copy</button>
                  <button className="icon-btn" onClick={() => remove(d.id)} style={{ color: "var(--danger)" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {open?.id === d.id && (
                <div className="output-body" style={{ padding: "18px 0 4px", whiteSpace: "pre-wrap" }}>
                  {d.content}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
