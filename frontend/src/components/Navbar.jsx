import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

const LINKS = [
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/store", label: "Store" },
  { to: "/pricing", label: "AI Suite" },
  { to: "/blog", label: "Insights" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="nav-brand" aria-label="TabsSoft Global Technologies — home">
          <img src="/assets/logo.jpeg" alt="TabsSoft Global Technologies" />
        </Link>

        <button className="nav-toggle" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className={`nav-links ${open ? "open" : ""}`}>
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
          <div className="nav-cta" style={{ marginLeft: 8 }}>
            {user ? (
              <Link to="/app" className="btn btn-primary btn-sm">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
                <Link to="/signup" className="btn btn-primary btn-sm">Get started</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
