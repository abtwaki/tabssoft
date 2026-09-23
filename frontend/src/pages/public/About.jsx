import { Award, Building2, GraduationCap, Landmark, ShieldCheck } from "lucide-react";

const CREDS = [
  "CITP — Chartered IT Practitioner",
  "MCPN — Member, Computer Professionals Nigeria",
  "M.Tech Applied Geophysics, FUTMinna",
  "IBM AI Analyst & Cloud Development",
  "ADAPTI Subject Matter Expert, DBI Abuja",
  "Faculty Advisor, ENACTUS FUTMinna",
];

const SERVICES = [
  { icon: Building2, title: "Software Development", text: "Enterprise web platforms, portals and internal systems." },
  { icon: GraduationCap, title: "TabsForge SchoolOS", text: "School management built for Nigerian institutions." },
  { icon: Users2, title: "IT Consulting & Training", text: "ADAPTI-style digital capacity programmes and advisory." },
  { icon: Cpu2, title: "AI Solutions", text: "Applied AI products and the TabsSoft AI Suite." },
];

function Users2(props) {
  return (
    <svg width={props.size || 22} height={props.size || 22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function Cpu2(props) {
  return (
    <svg width={props.size || 22} height={props.size || 22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2" />
    </svg>
  );
}

export default function About() {
  return (
    <>
      <section className="page-head" style={{ background: "var(--bg-soft)" }}>
        <div className="container">
          <span className="eyebrow">About TabsSoft</span>
          <h1>Built in Minna. Built to a global standard.</h1>
          <p>
            TabsSoft Global Technologies Limited (RC 9350407) is a Nigerian
            technology company delivering software development, school
            systems, IT consulting and applied AI — with a conviction that
            world-class engineering can and should come from Nigeria.
          </p>
        </div>
      </section>

      <section className="section tight">
        <div className="container">
          <div className="grid grid-4 stagger">
            {SERVICES.map((s) => (
              <div className="card" key={s.title}>
                <div className="card-icon"><s.icon size={22} /></div>
                <h3 style={{ fontSize: 16.5 }}>{s.title}</h3>
                <p style={{ fontSize: 14 }}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="split">
            <div className="founder-card">
              <img
                className="photo"
                src="/assets/founder.jpg"
                alt="Abraham Saidu Twaki — Founder & CEO, TabsSoft Global Technologies"
              />
              <div className="badge-float">
                <div className="dot"><Landmark size={19} /></div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Abraham Saidu Twaki</div>
                  <div className="small muted">Founder & Chief Executive Officer</div>
                </div>
              </div>
            </div>
            <div>
              <span className="eyebrow"><Award size={14} /> Founder & CEO</span>
              <h2 className="section-title" style={{ fontSize: 32 }}>
                A practitioner who ships — not just a title.
              </h2>
              <div className="prose" style={{ fontSize: 15.5 }}>
                <p>
                  Abraham Saidu Twaki, CITP, MCPN, is a Chartered Information
                  Technology Practitioner and Chief Systems Analyst — Webmaster
                  &amp; IT Officer at the Federal University of Technology,
                  Minna (FUTMinna), where he also serves the Africa Centre of
                  Excellence for Mycotoxin and Food Safety.
                </p>
                <p>
                  With over a decade in enterprise digital infrastructure, he
                  founded TabsSoft Global Technologies and serves as Principal
                  Consultant at EmperorTech Global Solutions — delivering
                  full-stack development, AI-driven workflows, and networking
                  infrastructure across sectors.
                </p>
                <p>
                  He holds an M.Tech in Applied Geophysics and a B.Tech in
                  Physics Electronics from FUTMinna, alongside IBM
                  certifications in AI Analyst and Cloud Development. As a
                  Consultant and Subject Matter Expert for ADAPTI at the
                  Digital Bridge Institute, Abuja, and Faculty Advisor for
                  ENACTUS FUTMinna, he extends the same capacity-building ethos
                  that drives TabsSoft's mission: world-class technology for
                  African institutions and professionals.
                </p>
              </div>
              <div className="cred-chips">
                {CREDS.map((c) => <span className="chip" key={c}>{c}</span>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section tight">
        <div className="container">
          <div className="stats-band">
            <div className="stat"><div className="num">RC 9350407</div><div className="lbl">CAC-registered company</div></div>
            <div className="stat"><div className="num">CITP</div><div className="lbl">Chartered IT Practitioner leadership</div></div>
            <div className="stat"><div className="num">FUTMinna</div><div className="lbl">Enterprise systems experience</div></div>
            <div className="stat"><div className="num">ADAPTI</div><div className="lbl">Tertiary-institution training partner</div></div>
          </div>
        </div>
      </section>
    </>
  );
}
