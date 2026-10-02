import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src="/assets/logo.jpeg" alt="TabsSoft Global Technologies" />
            <p>
              World-class software, AI tools and IT consulting — engineered in
              Nigeria, built for the global stage.
            </p>
          </div>
          <div>
            <h4>Company</h4>
            <Link to="/about">About us</Link>
            <Link to="/services">Services</Link>
            <Link to="/blog">Insights</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div>
            <h4>Products</h4>
            <Link to="/store">Store</Link>
            <a href="https://tabsforge.com" target="_blank" rel="noopener noreferrer">TabsForge SchoolOS</a>
            <Link to="/store">Litafi Nya Soko</Link>
            <Link to="/store">Nupe Hymns</Link>
          </div>
          <div>
            <h4>AI Suite</h4>
            <Link to="/pricing">Plans & pricing</Link>
            <Link to="/signup">Start free</Link>
            <Link to="/login">Sign in</Link>
          </div>
          <div>
            <h4>Legal</h4>
            <Link to="/privacy">Privacy policy</Link>
            <Link to="/privacy/litafi-nya-soko">Litafi Nya Soko privacy</Link>
            <Link to="/privacy/nupe-hymns">Nupe Hymns privacy</Link>
            <a href="mailto:info@tabssoftglobal.com">info@tabssoftglobal.com</a>
            <span style={{ display: "block", padding: "5px 0", fontSize: 14.5 }}>
              Minna, Niger State, Nigeria
            </span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} TabsSoft Global Technologies Limited · RC 9350407
          </span>
          <span>CITP · MCPN certified leadership</span>
        </div>
      </div>
    </footer>
  );
}
