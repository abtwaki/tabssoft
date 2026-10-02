# TabsSoft Global Technologies — Website + AI Suite

Public company site + subscription AI tools platform for Nigerian professionals.

**Stack:** Django 5 + DRF (REST API, JWT auth, Paystack billing, swappable AI
provider) · React 18 + Vite (public site + app + staff CMS) · PostgreSQL in
production (SQLite locally).

## Layout

```
backend/          Django project (tabssoft) + apps
  accounts/       users, roles, NDPR consent, JWT auth (+ logout blacklist),
                  password change/forgot/reset, account deletion
  billing/        plans, subscriptions, Paystack (init/verify/webhook/cancel),
                  subscription lifecycle (expiry → free-tier degradation)
  ai_engine/      provider interface (Anthropic|OpenAI), tool registry,
                  prompt templates, quota enforcement, saved documents
  cms/            blog posts + keyed site-content blocks (public /api/content/)
  staffadmin/     /api/admin/* — CMS API: subscribers, templates, blog,
                  site content, analytics
  core/           contact form, health check, field-level encryption
frontend/         Vite + React SPA (public pages incl. /store + per-product
                  privacy pages, /app dashboard, /admin CMS)
deploy/           Apache vhost, systemd unit, deploy.sh
```

## Local development

```bash
# Backend  (Python 3.10+)
cd backend
python -m venv .venv && source .venv/bin/activate   # .venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env    # fill in keys
python manage.py migrate
python manage.py seed_demo
python manage.py runserver 8003

# Frontend  (Node 18+)
cd frontend
npm install
npm run dev             # http://localhost:5173 — proxies /api to :8003
```

Demo logins (password `DemoPass2026!`): `admin@tabssoftglobal.com` (staff),
`civil@demo.tabssoft.ng`, `teacher@demo.tabssoft.ng`, `student@demo.tabssoft.ng`,
`business@demo.tabssoft.ng`, `pastor@demo.tabssoft.ng`,
`lecturer@demo.tabssoft.ng` — each on a different role/plan.

## Environment variables (backend/.env)

| Var | Purpose |
|---|---|
| `DJANGO_SECRET_KEY` | Django secret — required in prod |
| `DJANGO_DEBUG` | `false` in production |
| `DATABASE_URL` | e.g. `postgres://tabssoft:***@127.0.0.1:5432/tabssoft_db` |
| `AI_PROVIDER` | `anthropic` or `openai` |
| `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` | Provider key for the chosen engine |
| `ANTHROPIC_MODEL` / `OPENAI_MODEL` | Model overrides |
| `PAYSTACK_SECRET_KEY` / `PAYSTACK_PUBLIC_KEY` | Test keys now, live keys at launch |
| `FIELD_ENCRYPTION_KEY` | Fernet key — `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"` |
| `FRONTEND_URL` | e.g. `https://tabssoftglobal.com` — Paystack callback target |
| `EMAIL_*`, `CONTACT_EMAIL` | SMTP (Brevo: `smtp-relay.brevo.com:587`, TLS) + contact-form recipient. From address must be a verified Brevo sender |
| `DJANGO_ALLOWED_HOSTS`, `DJANGO_CSRF_TRUSTED_ORIGINS`, `CORS_ALLOWED_ORIGINS` | host/origin allowlists |

## AI engine

One provider integration powers all 28 tools. Each tool has a default
system prompt + user template in `ai_engine/tools.py`; staff can override any
of them live via **Admin → Prompt templates** (stored as versioned
`PromptTemplate` rows — the newest active version wins).

Quotas: per-plan monthly generation caps, enforced server-side before every
call; per-user rate limiting on `/api/ai/generate/` via DRF throttling.
Expired paid subscriptions automatically degrade to the free-tier quota.

Tests: `python manage.py test` — 19 tests covering auth, quota enforcement,
subscription expiry, role gating and generation (provider mocked).

## Payments

Paystack test mode. Flow: `/api/billing/initialize/` → hosted checkout →
redirect to `/app/billing/callback` → `/api/billing/verify/<ref>` activates the
subscription. Webhook: `/api/billing/webhook/paystack/` (HMAC-SHA512 verified).
The provider surface in `billing/paystack.py` is the swap point for
Flutterwave etc.

## Deployment (VPS, Apache + gunicorn)

Target: Ubuntu 22.04, Apache, PostgreSQL `tabssoft_db`, backend on
`127.0.0.1:8003`, frontend static build at
`/var/www/tabssoft-website/frontend/build`.

```bash
# On the server
createdb -U postgres tabssoft_db && createuser -U postgres tabssoft -P
# upload project, then:
cd tabssoftglobal && bash deploy/deploy.sh
# Once DNS resolves:
certbot --apache -d tabssoftglobal.com -d www.tabssoftglobal.com
```

Apache serves the React build directly; `/api/` and `/admin/` proxy to
gunicorn. See `deploy/apache/*.conf` and `deploy/systemd/tabssoft.service`.

Health check: `GET /api/health/` → `{status, db, ai_provider, ai_configured}`.
