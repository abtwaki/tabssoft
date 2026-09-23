import {
  Award, Bot, Building2, Code2, Cpu, GraduationCap, Landmark,
  MessageCircle, ShieldCheck, Sparkles, Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import HeroCarousel from "../../components/HeroCarousel";

const SERVICES = [
  {
    icon: Code2,
    title: "Software Development",
    text: "Custom platforms, portals and internal systems — engineered end-to-end to global standards.",
  },
  {
    icon: GraduationCap,
    title: "TabsForge SchoolOS",
    text: "A complete operating system for schools: admissions, academics, finance and communications.",
  },
  {
    icon: Users,
    title: "IT Consulting & Training",
    text: "Digital transformation and capacity building, including ADAPTI-style programmes for tertiary institutions.",
  },
  {
    icon: Cpu,
    title: "AI Solutions",
    text: "Applied AI for institutions and businesses — from workflow automation to the TabsSoft AI Suite.",
  },
];

const SUITE_ROLES = [
  { icon: Landmark, label: "Civil Servants", desc: "Memos, promotion letters, circular summaries" },
  { icon: GraduationCap, label: "Teachers", desc: "Lesson plans, schemes of work, question sets" },
  { icon: Users, label: "Students", desc: "Study notes, essay outlines, scholarship letters" },
  { icon: Building2, label: "Business Owners", desc: "Business plans, proposals, invoices, marketing" },
  { icon: BookIcon, label: "Ministers", desc: "Sermon outlines, Bible studies, newsletters" },
  { icon: Award, label: "Lecturers", desc: "Course outlines, proposals, question banks" },
];

function BookIcon(props) {
  return (
    <svg width={props.size || 22} height={props.size || 22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

export default function Home() {
  return (
    <>
      <HeroCarousel />

      <section className="trust-strip">
        <div className="container trust-inner">
          <span className="hero-badge"><ShieldCheck size={17} /> CAC-registered · RC 9350407</span>
          <span className="hero-badge"><Award size={17} /> CITP & MCPN certified leadership</span>
          <span className="hero-badge"><Bot size={17} /> NDPR-compliant data handling</span>
          <span className="hero-badge"><Sparkles size={17} /> Minna, Nigeria → the world</span>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="center">
            <span className="eyebrow">What we do</span>
            <h2 className="section-title">One company. Four disciplines.</h2>
            <p className="section-lede">
              From school management systems to applied AI, we build the digital
              infrastructure Nigerian institutions run on.
            </p>
          </div>
          <div className="grid grid-4 mt-4 stagger">
            {SERVICES.map((s) => (
              <div className="card" key={s.title}>
                <div className="card-icon"><s.icon size={22} /></div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section tight" style={{ background: "var(--bg-soft)" }}>
        <div className="container">
          <div className="stats-band">
            <div className="stat"><div className="num">10+</div><div className="lbl">Years of enterprise experience</div></div>
            <div className="stat"><div className="num">6</div><div className="lbl">Professional AI workspaces</div></div>
            <div className="stat"><div className="num">29</div><div className="lbl">Purpose-built AI tools</div></div>
            <div className="stat"><div className="num">₦</div><div className="lbl">Priced for Nigeria, in Naira</div></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="split">
            <div>
              <span className="eyebrow"><MessageCircle size={14} /> TabsSoft AI Suite</span>
              <h2 className="section-title">
                AI assistants that actually understand Nigerian work.
              </h2>
              <p className="section-lede">
                Generic AI tools don't know a civil-service memo from a
                marketing brief. Ours do. Every workspace is tuned for the role
                you actually work in — with Nigerian formats, tone, and context
                built in.
              </p>
              <div className="mt-3 flex wrap">
                <Link to="/pricing" className="btn btn-primary">See plans & pricing</Link>
                <Link to="/signup" className="btn btn-ghost">Try it free →</Link>
              </div>
            </div>
            <div className="grid grid-2 stagger">
              {SUITE_ROLES.map((r) => (
                <div className="card" key={r.label} style={{ padding: 20 }}>
                  <div className="card-icon" style={{ marginBottom: 12 }}><r.icon size={20} /></div>
                  <h3 style={{ fontSize: 15.5 }}>{r.label}</h3>
                  <p style={{ fontSize: 13.5 }}>{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section tight">
        <div className="container">
          <div className="cta-band fade-in">
            <h2>Ready to work smarter?</h2>
            <p>
              Join the professionals already using TabsSoft AI Suite. Free tier
              included — no card required.
            </p>
            <div className="hero-actions">
              <Link to="/signup" className="btn btn-accent btn-lg">Create free account</Link>
              <Link to="/contact" className="btn btn-lg" style={{ background: "rgba(255,255,255,.12)", color: "#fff", border: "1px solid rgba(255,255,255,.25)" }}>
                Talk to us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
