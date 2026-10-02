import { ArrowRight, BookOpen, ExternalLink, GraduationCap, Music, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import TabsForgeLogo from "../../components/TabsForgeLogo";

const PRODUCTS = [
  {
    id: "tabsforge",
    name: "TabsForge SchoolOS",
    logo: true,
    tagline: "The complete operating system for schools.",
    description:
      "Admissions, enrolment and student records; academics, results and attendance; fees, invoicing and reporting; parent and staff communications — one platform, from admissions to graduation, built for Nigerian schools and colleges.",
    href: "https://tabsforge.com",
    cta: "Visit tabsforge.com",
    privacy: "/privacy/tabsforge-schoolos",
  },
  {
    id: "litafi",
    name: "Litafi Nya Soko",
    icon: BookOpen,
    tagline: "The complete Bible in Nupe — Old & New Testaments.",
    description:
      "A digital Nupe Bible for phones: the full Old and New Testaments plus a Topics & Life Issues study guide, designed for uninterrupted offline reading. Scripture text © Bible Society of Nigeria.",
    href: "https://play.google.com/store/search?q=Litafi%20Nya%20Soko&c=apps",
    cta: "Find on Google Play",
    privacy: "/privacy/litafi-nya-soko",
  },
  {
    id: "hymns",
    name: "Nupe Hymns",
    icon: Music,
    tagline: "The Nupe hymnbook, always in your pocket.",
    description:
      "Nupe-language hymns for personal devotion and congregational worship — searchable, readable offline, and organised for services, choir practice and family worship.",
    privacy: "/privacy/nupe-hymns",
    soon: true,
  },
];

const CLIENTS = [
  {
    name: "Zhiri's Mentorship & Career Centre",
    domain: "zhirismcc.com",
    href: "https://zhirismcc.com",
    about:
      "A mentorship and career-development organisation empowering Africa's next generation of scholars — guiding undergraduates to competitive scholarships and global opportunities.",
  },
  {
    name: "Lift Motivational",
    domain: "liftmotivationals.com",
    href: "https://liftmotivationals.com",
    about:
      "A daily scripture-based motivational series by Olamide Adeoye — short, divinely inspired messages published every morning to start the day lifted.",
  },
  {
    name: "ACEMFS — FUT Minna",
    domain: "acemfs.futminna.edu.ng",
    href: "https://acemfs.futminna.edu.ng",
    about:
      "The Africa Centre of Excellence for Mycotoxin and Food Safety — a World Bank-funded centre running M.Tech/Ph.D programmes, regional food-safety research and industry outreach.",
  },
];

export default function Store() {
  return (
    <>
      <section className="page-head" style={{ background: "var(--bg-soft)" }}>
        <div className="container">
          <span className="eyebrow">Store</span>
          <h1>Products we've built. Clients we serve.</h1>
          <p>
            Software we own and operate, and the institutions who trust us with
            their digital presence.
          </p>
        </div>
      </section>

      <section className="section tight">
        <div className="container">
          <span className="eyebrow">Our products</span>
          <h2 className="section-title" style={{ fontSize: 32 }}>Built by TabsSoft, used every day.</h2>
          <div className="grid grid-3 stagger" style={{ marginTop: 30 }}>
            {PRODUCTS.map((p) => (
              <div className="card" key={p.id} style={{ padding: 30, display: "flex", flexDirection: "column" }}>
                {p.logo ? (
                  <TabsForgeLogo height={50} style={{ marginBottom: 16 }} />
                ) : (
                  <span className="card-icon" style={{ margin: "0 0 16px" }}>
                    {p.icon && <p.icon size={22} />}
                  </span>
                )}
                <h3 style={{ fontSize: 20, marginBottom: 6 }}>{p.name}</h3>
                <div className="small" style={{ color: "var(--primary)", fontWeight: 600, marginBottom: 12 }}>
                  {p.tagline}
                </div>
                <p className="muted small" style={{ flex: 1 }}>{p.description}</p>
                <div className="flex wrap" style={{ marginTop: 20, gap: 10 }}>
                  {p.soon ? (
                    <span className="badge badge-blue">Coming soon</span>
                  ) : (
                    <a href={p.href} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                      {p.cta} <ExternalLink size={14} />
                    </a>
                  )}
                  <Link to={p.privacy} className="btn btn-ghost btn-sm">
                    <ShieldCheck size={14} /> Privacy policy
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section tight" style={{ background: "var(--bg-soft)" }}>
        <div className="container">
          <span className="eyebrow">Our clients</span>
          <h2 className="section-title" style={{ fontSize: 32 }}>Institutions running on our work.</h2>
          <div className="grid grid-3 stagger" style={{ marginTop: 30 }}>
            {CLIENTS.map((c) => (
              <a
                key={c.domain}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="card"
                style={{ padding: 30, display: "block", color: "inherit" }}
              >
                <h3 style={{ fontSize: 19, marginBottom: 4 }}>{c.name}</h3>
                <div className="small" style={{ color: "var(--primary)", fontWeight: 600, marginBottom: 12 }}>
                  {c.domain}
                </div>
                <p className="muted small">{c.about}</p>
                <span className="small" style={{ color: "var(--primary)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, marginTop: 14 }}>
                  Visit site <ArrowRight size={14} />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section tight">
        <div className="container">
          <div className="cta-band">
            <h2>Need software for your institution?</h2>
            <p>Schools, churches, ministries, businesses — we build it end-to-end.</p>
            <div className="hero-actions">
              <Link to="/contact" className="btn btn-accent btn-lg">
                <GraduationCap size={17} /> Talk to us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
