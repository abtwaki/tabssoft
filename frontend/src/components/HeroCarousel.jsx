import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const SLIDES = [
  {
    key: "software",
    bg: "/assets/hero/software.svg",
    eyebrow: "Software Development",
    title: "Enterprise software, engineered to a global standard.",
    sub: "Custom platforms, portals and internal systems — designed, built and supported end-to-end.",
    cta: { to: "/services", label: "Explore services" },
  },
  {
    key: "schoolos",
    bg: "/assets/hero/schoolos.svg",
    eyebrow: "TabsForge SchoolOS",
    title: "One operating system for the entire school.",
    sub: "Admissions, academics, finance and communications — built for how Nigerian schools actually run.",
    cta: { to: "/services", label: "See SchoolOS" },
  },
  {
    key: "consulting",
    bg: "/assets/hero/consulting.svg",
    eyebrow: "IT Consulting & Training",
    title: "Digital capacity for institutions that mean business.",
    sub: "ADAPTI-style training, systems analysis and infrastructure — from boardroom strategy to hands-on upskilling.",
    cta: { to: "/contact", label: "Talk to us" },
  },
  {
    key: "ai",
    bg: "/assets/hero/ai-suite.svg",
    eyebrow: "TabsSoft AI Suite",
    title: "AI assistants tuned for Nigerian professionals.",
    sub: "Role-specific workspaces for civil servants, teachers, students, business owners, ministers and lecturers.",
    cta: { to: "/signup", label: "Start free — no card needed", accent: true },
  },
];

const DURATION = 6500;

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);
  const touchX = useRef(null);

  const go = useCallback((i) => {
    setIndex(((i % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);

  const next = useCallback(() => go(index + 1), [index, go]);
  const prev = useCallback(() => go(index - 1), [index, go]);

  useEffect(() => {
    if (paused) return;
    timer.current = setTimeout(next, DURATION);
    return () => clearTimeout(timer.current);
  }, [index, paused, next]);

  const onKey = (e) => {
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  };

  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 45) (dx < 0 ? next : prev)();
    touchX.current = null;
  };

  return (
    <section
      className="hero-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={onKey}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
      aria-label="TabsSoft services highlights"
    >
      {SLIDES.map((s, i) => (
        <div
          key={s.key}
          className={`hc-slide ${i === index ? "active" : ""}`}
          aria-hidden={i !== index}
        >
          <div className="hc-bg" style={{ backgroundImage: `url(${s.bg})` }} />
          <div className="hc-overlay" />
          <div className="container hc-content">
            <div className="hc-caption" key={`${s.key}-${i === index}`}>
              <span className="hc-eyebrow">{s.eyebrow}</span>
              <h1>{s.title}</h1>
              <p>{s.sub}</p>
              <div className="hero-actions">
                <Link to={s.cta.to} className={`btn btn-lg ${s.cta.accent ? "btn-accent" : "btn-light"}`} tabIndex={i === index ? 0 : -1}>
                  {s.cta.label} <ArrowRight size={17} />
                </Link>
                <Link to="/pricing" className="btn btn-lg btn-glass" tabIndex={i === index ? 0 : -1}>
                  AI Suite pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button className="hc-arrow prev" onClick={prev} aria-label="Previous slide">
        <ChevronLeft size={24} />
      </button>
      <button className="hc-arrow next" onClick={next} aria-label="Next slide">
        <ChevronRight size={24} />
      </button>

      <div className="hc-dots" role="tablist" aria-label="Slides">
        {SLIDES.map((s, i) => (
          <button
            key={s.key}
            role="tab"
            aria-selected={i === index}
            aria-label={s.eyebrow}
            className={`hc-dot ${i === index ? "active" : ""}`}
            onClick={() => go(i)}
          >
            <span className="hc-dot-fill" style={i === index && !paused ? { animationDuration: `${DURATION}ms` } : {}} />
          </button>
        ))}
      </div>
    </section>
  );
}
