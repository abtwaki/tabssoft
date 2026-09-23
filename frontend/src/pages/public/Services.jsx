import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import TabsForgeLogo from "../../components/TabsForgeLogo";

const SECTIONS = [
  {
    id: "software",
    title: "Software Development",
    lead: "Custom platforms engineered end-to-end — discovery, design, build, deploy, support.",
    points: [
      "Institutional portals and management systems",
      "Web applications and REST APIs",
      "Legacy system modernization",
      "Long-term maintenance and support",
    ],
  },
  {
    id: "tabsforge",
    title: "TabsForge SchoolOS",
    logo: true,
    lead: "A complete operating system for schools — admissions to graduation.",
    points: [
      "Admissions, enrolment and student records",
      "Academics: results, gradebooks, attendance",
      "Finance: fees, invoicing, reporting",
      "Parent/staff communications portal",
    ],
  },
  {
    id: "consulting",
    title: "IT Consulting & Training",
    lead: "Practical digital capacity — from boardroom strategy to hands-on staff training.",
    points: [
      "ADAPTI-style digital appreciation for tertiary institutions",
      "Network and infrastructure design",
      "Systems analysis and digital transformation",
      "Team upskilling programmes",
    ],
  },
  {
    id: "ai-suite",
    title: "TabsSoft AI Suite",
    lead: "Subscription AI assistants tuned for Nigerian professionals — the product this site powers.",
    points: [
      "Role workspaces: civil servants, teachers, students, business owners, ministers, lecturers",
      "Email, WhatsApp, CV and document tools",
      "Per-tier quotas with Paystack billing",
      "NDPR-compliant data handling",
    ],
    cta: true,
  },
];

export default function Services() {
  return (
    <>
      <section className="page-head" style={{ background: "var(--bg-soft)" }}>
        <div className="container">
          <span className="eyebrow">Services</span>
          <h1>Everything we build, built properly.</h1>
          <p>
            Four practice areas, one standard: technology that holds up against
            the best in the world — because our clients deserve nothing less.
          </p>
        </div>
      </section>

      <section className="section tight">
        <div className="container">
          <div className="grid grid-2 stagger">
            {SECTIONS.map((s) => (
              <div className="card" key={s.id} id={s.id} style={{ padding: 34 }}>
                {s.logo ? (
                  <TabsForgeLogo height={58} style={{ marginBottom: 14 }} />
                ) : (
                  <h2 style={{ fontSize: 23, marginBottom: 8 }}>{s.title}</h2>
                )}
                <p className="muted" style={{ marginBottom: 18 }}>{s.lead}</p>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {s.points.map((p) => (
                    <li key={p} style={{ display: "flex", gap: 10, padding: "6px 0", fontSize: 14.5, color: "var(--ink-700)" }}>
                      <CheckCircle2 size={17} color="var(--success)" style={{ flexShrink: 0, marginTop: 3 }} />
                      {p}
                    </li>
                  ))}
                </ul>
                {s.cta && (
                  <Link to="/pricing" className="btn btn-primary btn-sm" style={{ marginTop: 18 }}>
                    See AI Suite plans <ArrowRight size={15} />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section tight">
        <div className="container">
          <div className="cta-band">
            <h2>Have a project in mind?</h2>
            <p>Tell us what you're building. We'll tell you honestly how we'd approach it.</p>
            <div className="hero-actions">
              <Link to="/contact" className="btn btn-accent btn-lg">Get in touch</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
