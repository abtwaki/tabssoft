import { CheckCircle2, Edit3, Newspaper, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import RichEditor from "../../components/RichEditor";

const EMPTY = { title: "", excerpt: "", content: "", cover_image_url: "", status: "draft" };

export default function AdminBlog() {
  const [posts, setPosts] = useState(null);
  const [editing, setEditing] = useState(null); // null=list, "new", or post object
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState("");

  const load = () => api("/admin/blog/").then(setPosts).catch(() => setPosts([]));
  useEffect(() => { load(); }, []);

  const startEdit = (post) => {
    setEditing(post);
    setForm(post ? {
      title: post.title, excerpt: post.excerpt, content: post.content,
      cover_image_url: post.cover_image_url || "", status: post.status,
    } : EMPTY);
  };

  const save = async (e) => {
    e.preventDefault();
    if (editing === "new") {
      await api("/admin/blog/", { method: "POST", body: form });
    } else {
      await api(`/admin/blog/${editing.id}/`, { method: "PATCH", body: form });
    }
    setMsg("Saved.");
    setEditing(null);
    load();
    setTimeout(() => setMsg(""), 2200);
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this post permanently?")) return;
    await api(`/admin/blog/${id}/`, { method: "DELETE" });
    load();
  };

  if (editing !== null) {
    return (
      <div className="fade-in" style={{ maxWidth: 860 }}>
        <div className="app-header">
          <div>
            <h1>{editing === "new" ? "New post" : "Edit post"}</h1>
            <div className="sub">Content goes live on the public Insights page when published.</div>
          </div>
        </div>
        <form onSubmit={save} className="card">
          <div className="field">
            <label>Title <span className="req">*</span></label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="field">
            <label>Excerpt</label>
            <input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="One-line teaser shown on the blog index" />
          </div>
          <div className="field">
            <label>Cover image URL (optional)</label>
            <input value={form.cover_image_url} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} placeholder="https://…" />
          </div>
          <div className="field">
            <label>Content</label>
            <RichEditor value={form.content} onChange={(html) => setForm({ ...form, content: html })} />
          </div>
          <div className="flex between wrap">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              style={{ padding: "10px 14px", border: "1px solid var(--border-strong)", borderRadius: 10 }}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <div className="flex">
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-primary"><CheckCircle2 size={15} /> Save post</button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="app-header">
        <div>
          <h1>Blog posts</h1>
          <div className="sub">Manage the public Insights section.</div>
        </div>
        <button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={() => startEdit(null)}>
          <Plus size={16} /> New post
        </button>
      </div>

      {msg && <div className="alert alert-success"><CheckCircle2 size={16} />{msg}</div>}

      {posts === null ? (
        <div className="center" style={{ padding: 60 }}><div className="spinner dark" style={{ width: 30, height: 30, margin: "0 auto" }} /></div>
      ) : posts.length === 0 ? (
        <div className="card center muted" style={{ padding: 50 }}>
          <Newspaper size={36} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
          No posts yet.
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>Title</th><th>Status</th><th>Published</th><th></th></tr></thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.title}</td>
                  <td>
                    <span className={`badge ${p.status === "published" ? "badge-green" : "badge-gray"}`}>{p.status}</span>
                  </td>
                  <td className="small">{p.published_at ? new Date(p.published_at).toLocaleDateString("en-NG") : "—"}</td>
                  <td>
                    <div className="flex" style={{ justifyContent: "flex-end" }}>
                      <button className="icon-btn" onClick={() => startEdit(p)}><Edit3 size={14} /> Edit</button>
                      <button className="icon-btn" style={{ color: "var(--danger)" }} onClick={() => remove(p.id)}><Trash2 size={14} /></button>
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
