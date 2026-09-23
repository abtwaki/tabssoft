import { Calendar, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";

export default function Blog() {
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    api("/blog/posts/", { auth: false })
      .then((d) => setPosts(d.results || d))
      .catch(() => setPosts([]));
  }, []);

  return (
    <>
      <section className="page-head" style={{ background: "var(--bg-soft)" }}>
        <div className="container">
          <span className="eyebrow">Insights</span>
          <h1>Notes from the team.</h1>
          <p>Product news, engineering practice, and applied AI for Nigerian institutions.</p>
        </div>
      </section>

      <section className="section tight">
        <div className="container">
          {posts === null ? (
            <div className="center" style={{ padding: 60 }}><div className="spinner dark" style={{ width: 30, height: 30, margin: "0 auto" }} /></div>
          ) : posts.length === 0 ? (
            <div className="center muted" style={{ padding: 60 }}>No posts yet — check back soon.</div>
          ) : (
            <div className="grid grid-3 stagger">
              {posts.map((p) => (
                <Link to={`/blog/${p.slug}`} key={p.id} className="card post-card" style={{ color: "inherit" }}>
                  <h3 style={{ fontSize: 18, lineHeight: 1.35 }}>{p.title}</h3>
                  <p className="mt-1" style={{ fontSize: 14.5 }}>{p.excerpt}</p>
                  <div className="meta">
                    <span className="flex" style={{ gap: 6 }}><User size={13} /> {p.author_name}</span>
                    {p.published_at && (
                      <span className="flex" style={{ gap: 6 }}>
                        <Calendar size={13} />
                        {new Date(p.published_at).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
