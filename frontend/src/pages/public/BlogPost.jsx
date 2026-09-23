import { ArrowLeft, Calendar, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../api/client";

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    api(`/blog/posts/${slug}/`, { auth: false })
      .then(setPost)
      .catch(() => setMissing(true));
  }, [slug]);

  if (missing) {
    return (
      <div className="container section center">
        <h1 className="section-title">Post not found</h1>
        <Link to="/blog" className="btn btn-primary mt-3">Back to Insights</Link>
      </div>
    );
  }
  if (!post) {
    return <div className="container section center"><div className="spinner dark" style={{ width: 30, height: 30 }} /></div>;
  }

  return (
    <article className="section tight">
      <div className="container" style={{ maxWidth: 780 }}>
        <Link to="/blog" className="small flex" style={{ gap: 6, marginBottom: 26 }}>
          <ArrowLeft size={15} /> All posts
        </Link>
        <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", marginBottom: 16 }}>{post.title}</h1>
        <div className="flex muted small" style={{ gap: 18, marginBottom: 36 }}>
          <span className="flex" style={{ gap: 6 }}><User size={14} /> {post.author_name}</span>
          {post.published_at && (
            <span className="flex" style={{ gap: 6 }}>
              <Calendar size={14} />
              {new Date(post.published_at).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          )}
        </div>
        {/* Content comes from the staff WYSIWYG editor — sanitized by staff policy. */}
        <div className="prose" dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
    </article>
  );
}
