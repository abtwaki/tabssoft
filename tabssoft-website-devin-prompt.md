# Devin AI Prompt — Build TabsSoft Global Technologies Website + AI Suite (Refined)

Copy everything in the box below into Devin AI Desktop as a single task. Attach three files alongside it: `TabsSoft_Main_Logo.jpeg` (the official logo), `abraham-twaki-founder-photo.jpg` (the Founder/CEO's photo, converted from the original camera RAW file for web use), and this prompt.

**Deployment note (matches the current standardized VPS setup — Apache, Python + React, not the earlier Next.js hybrid plan):**
- Single Django backend on `127.0.0.1:8003`, behind the existing Apache config for tabssoftglobal.com
- React frontend built as a static production build, served directly by Apache as DocumentRoot from `/var/www/tabssoft-website/frontend/build`
- Database stays `tabssoft_db` as already provisioned
- Apache routes `/api/` and `/admin/` to `127.0.0.1:8003`, everything else serves the React build

---

```
Act as one of the best software engineers and product designers in the world — someone with decades of experience across both engineering and UI/UX, who has built and shipped products at the highest level at top global technology companies. Bring that standard, not a template standard, to this build. Build the TabsSoft Global Technologies Limited website — both the public company site and a subscription-based AI tools suite for Nigerian professionals — to genuine Grade-A, global-best-practice quality: the kind of execution, polish, performance, and attention to detail that would hold up next to any world-class SaaS product, not just "functional."

PROJECT CONTEXT
TabsSoft Global Technologies Limited (RC: 9350407, Minna, Niger State, Nigeria) needs a public-facing website that establishes real credibility as a serious technology company on the global stage, plus a subscription AI product line ("TabsSoft AI Suite") that Nigerians sign up for and use directly through the site.

BRAND IDENTITY
- Logo file: TabsSoft_Main_Logo.jpeg (attached) — use this exact file as the logo asset everywhere the brand mark appears. Do not redraw, simplify, or replace it.
- Color palette, sampled directly from the logo — use these as the site's primary, consistently-applied brand palette throughout (navigation, headers, buttons, section accents, icons, footer) rather than a token accent color buried in a mostly-neutral design: Deep brand blue #194C9F, bright cyan #53C7EC, light cyan #85D3EA, slate blue #517EBF. Pair with white/near-white content backgrounds and standard dark text for readability — the palette should read as confident and global-tech-grade, not garish; take design cues from how top enterprise SaaS brands (Stripe, Linear, Notion-tier polish) use a strong primary palette with restraint and plenty of white space.
- Typography, spacing, and micro-interactions should reflect the same "worked at a top global tech company" standard referenced above — real attention to hierarchy, whitespace, hover/focus states, and responsive behavior, not default framework styling.

PART 1 — PUBLIC COMPANY SITE
- Home: hero, what TabsSoft does, credibility markers (RC number, CITP/CPN credentials, notable clients/institutions served)
- About: company profile, mission, services overview (software development, TabsForge SchoolOS, IT consulting, AI training) AND a dedicated Founder/CEO section featuring Abraham Saidu Twaki, using his photo (abraham-twaki-founder-photo.jpg, attached) and this bio, adapted for a confident global-pitch tone rather than shortened or generic:

  "Abraham Saidu Twaki, CITP, MCPN, is a Chartered Information Technology Practitioner and Chief Systems Analyst — Webmaster & IT Officer at the Federal University of Technology, Minna (FUTMinna), where he also serves the Africa Centre of Excellence for Mycotoxin and Food Safety. With over a decade of experience in enterprise digital infrastructure, he is the Founder and CEO of TabsSoft Global Technologies Limited and Principal Consultant at EmperorTech Global Solutions Limited, delivering full-stack development, AI-driven workflows, and networking infrastructure across sectors. He holds an M.Tech in Applied Geophysics and a B.Tech in Physics Electronics from FUTMinna, alongside IBM certifications in AI Analyst and Cloud Development. He is also a Consultant and Subject Matter Expert for ADAPTI (Advanced Digital Appreciation Program for Tertiary Institutions) at the Digital Bridge Institute, Abuja, and serves as Faculty Advisor for ENACTUS FUTMinna — extending the same mentorship and capacity-building ethos that drives TabsSoft's mission of bringing world-class technology to African institutions and professionals."

- Services: dedicated pages/sections for software development, TabsForge, IT consulting/ADAPTI-style training, and the AI Suite (Part 2)
- Contact page with a working contact form (emails the TabsSoft team)
- Blog/Insights section, manageable from the CMS (Part 3) without a developer

PART 2 — TABSSOFT AI SUITE (subscription product, the core of this build)
A single underlying AI assistant engine (one Claude API integration) exposed through role-specific "workspaces." Each workspace uses its own tuned system prompts and templates but shares the same backend engine, quota system, and UI shell — do not build separate AI integrations per role.

General-purpose tools (available to every subscriber regardless of role):
- Email Assistant: compose new emails and draft replies to pasted incoming emails, with tone selection (formal/official, friendly, persuasive) and Nigerian business-English defaults
- WhatsApp Assistant: compose and format WhatsApp messages (personal, business broadcast, customer-service replies); Phase 1 = in-app message drafting tool; design the data model so a real WhatsApp Business API connection can be added later as a Pro/Business-tier feature without a rebuild
- CV Builder & Reviewer: multiple CV format templates (Nigerian civil-service format, academic/CV-with-publications format, corporate/private-sector format, entry-level/no-experience format), AI-assisted content generation from a user's raw work history, plus an AI review/critique mode for a CV the user already has, and a matching cover-letter generator

Role-specific workspaces (each is a tab in the dashboard, with its own tuned prompt templates):
- Civil Servants: official memo writing, promotion request letters, circular/policy summarization, civil-service-format CV tools (linked to the shared CV Builder)
- Teachers: lesson plan generator, scheme-of-work assistant, report card comment generator, exam/test question generator
- Students: study-notes summarizer, essay/assignment structuring assistant (framed as a writing aid and outliner — include a visible academic-integrity notice, not a full-essay ghostwriter), scholarship/personal-statement assistant, study planner
- Business Owners: business plan generator, proposal/pitch deck text generator, invoice/quotation drafting, marketing copy and social-media caption generator
- Gospel Minister / Pastor: sermon outline generator, Bible study guide generator, event/program announcement text, congregation newsletter drafting
- Lecturer: course outline/syllabus generator, research proposal assistant, exam/question-bank generator, abstract/summary assistant for academic papers

SUBSCRIPTION & BILLING
- Tiered plans (e.g., Free trial, Basic, Pro, Business) priced in Naira
- Payment via Paystack or Flutterwave (implement one, keep the integration behind a swappable interface, use sandbox/test keys to build and test now)
- Per-tier monthly usage quotas on AI generations, enforced server-side (track usage per user per tool, reject/soft-block once quota is hit, show remaining usage in the UI)
- Self-service upgrade/downgrade/cancel from account settings

PART 3 — ADMIN CMS (for the TabsSoft team, not subscribers)
- Manage public site content (blog posts, service descriptions) with a WYSIWYG editor — no code changes needed for content updates
- Manage AI Suite prompt templates per role/tool from a form-based editor, so tuning the assistants doesn't require a redeploy
- Subscriber management: view/search users, manually adjust a subscription or quota, view usage analytics per tool and per tier
- Revenue/usage dashboard: active subscribers by tier, monthly revenue, most-used tools

SECURITY & DATA PROTECTION
- This product handles personal data (CVs, email drafts, personal statements) — encrypt sensitive fields at rest, enforce HTTPS everywhere, and follow Nigeria Data Protection Regulation (NDPR) principles: clear consent on signup, a visible privacy policy, and a user-accessible way to delete their account and data
- Sanitize and length-limit all user input sent to the AI provider; rate-limit AI endpoints per user to prevent abuse
- Standard Django protections (CSRF, XSS, SQLi) must be intact on every API endpoint; the frontend must never hold the Claude API key

QUALITY BAR — DO NOT SHIP UNTIL THIS IS TRUE
Before calling anything done, review it the way a principal engineer and a senior product designer at a top global tech company would review a launch: every screen intentional, every interaction smooth, every AI tool genuinely functional end-to-end (no mocked outputs), fast page loads, clean responsive behavior on mobile, and a brand presence — logo, color, typography, founder story — that feels like a real global technology company, because that is the goal here, not a template SaaS starter.

DELIVERABLES
1. Working React public site + AI Suite frontend (static production build), reflecting the brand identity and quality bar above
2. Working Django REST API backend with auth, subscriptions, quota enforcement, and the AI orchestration layer
3. All general-purpose and role-specific AI tools functional end-to-end (not placeholders)
4. Admin CMS for content, prompt templates, and subscriber management
5. Paystack or Flutterwave integration working in test mode
6. Database migrations + a seed script (a few demo users across different roles/tiers)
7. Deployed on the VPS per the Apache/port setup described above, with a health-check endpoint on the backend
8. README covering local setup, environment variables, and deployment steps
```
