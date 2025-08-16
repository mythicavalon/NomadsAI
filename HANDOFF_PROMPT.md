# NomadAI — Handoff Brief for Next Agent

## Summary
NomadAI is an AI-powered travel companion with a FastAPI backend, Next.js + Tailwind frontend, and an optional Node/Express OpenAI-compatible proxy. The app supports itinerary generation, travel signals, a memory journal, email digest, and interactive chat. It can run in purely free/offline demo mode or as a fully online AI product using GPT-OSS/OpenAI-compatible endpoints.

## Live URLs
- Frontend (Vercel): https://nomads-ai-o7lq.vercel.app/
- Backend (Render): https://nomadai-backend.onrender.com

## Repos/Dirs
- `backend/` — FastAPI app
  - Endpoints: `/api/itineraries`, `/api/signals`, `/api/memory`, `/api/digest`, `/api/chat`, `/healthz`
  - Online mode via DuckDuckGo search (signals) and Wikipedia attractions (itinerary/LLM context)
  - GPT config via env or per-request overrides; SMTP fallback writes to `outbox/`
  - Tests: `backend/tests/test_api.py` (4 passing)
  - Deploy: Render (render.yaml) or Railway (railway.json)
- `frontend/` — Next.js + Tailwind UI
  - Hero header, tabs (Chat | Itinerary | Nomad Tools), Faculty-inspired visual theme
  - Chat: elegant bubbles, sticky input, suggestion chips; uses `/api/chat`
  - Settings: store GPT base URL/API key/model in localStorage; sent to backend per request
  - Home: itinerary builder + signals; Online mode toggle
  - Nomad Tools: placeholder grid (Cost Calculator, Visa Info, Coworking Map)
- `express-backend/` — Node.js Express OpenAI-compatible `/v1/chat/completions`
  - Proxies to OPENAI_BASE_URL; conditional Authorization header per env
  - Ready for Render deployment
- Docs: `README.md`, `docs/`, `CHANGELOG.md` (current release 0.5.0)

## Current Behavior
- Itinerary generation:
  - Uses LLM if GPT is configured (env or per-request), with Wikipedia context to produce varied activities
  - Falls back to knowledge + mock signals
- Signals feed:
  - Combines mock flights/hotels with optional live news via DuckDuckGo; filters past events
- Chat:
  - Uses GPT-OSS/OpenAI-compatible when keys set; otherwise synthesizes from local knowledge + signals
- Frontend:
  - Modern, accessible UI; mobile responsive; no backend API changes required

## Configuration
- Backend env (Render):
  - DATABASE_URL, CORS_ORIGINS
  - GPT_OSS_BASE_URL/OPENAI_BASE_URL, GPT_OSS_API_KEY/OPENAI_API_KEY, GPT_OSS_MODEL/OPENAI_MODEL
  - SMTP_* (optional)
- Frontend env (Vercel):
  - NEXT_PUBLIC_API_BASE = <backend URL>
- Frontend settings (client-side):
  - gpt_base_url / gpt_api_key / gpt_model saved in localStorage; sent on chat/itinerary calls

## Known Gaps / Next Steps
1) True streaming chat and tool-use
   - Upgrade `/api/chat` to server-sent events (SSE) and integrate tool calls for web-search and Wikipedia retrieval
2) Enrich signals with more sources
   - Add free APIs (Ticketmaster Discovery, Eventbrite public feeds, or city open-data where allowed)
3) Itinerary ranking and personalization
   - Rerank suggestions with user preferences and constraint satisfaction; save profiles
4) Nomad Tools (MVPs)
   - Cost estimator (Numbeo/open data), Visa eligibility (static rules + external links), Coworking map (OpenStreetMap + Overpass API)
5) Observability + QA
   - Add logging/metrics, Sentry, and e2e tests for critical flows
6) Monetization hooks (later)
   - Affiliate links for flights/hotels (opt-in), premium AI features

## How to Run Locally
- Backend
  - `cd backend && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && cp .env.example .env && python uvicorn_main.py`
- Frontend
  - `cd frontend && npm install && cp .env.example .env.local && npm run dev`
- Optional Express proxy
  - `cd express-backend && cp .env.example .env && npm install && npm start`

## Testing
- Backend unit tests: `cd backend && pytest -q`
- Curl sanity: `/healthz`, `/api/signals`, `/api/itineraries`, `/api/chat`

## Contact / Branding
- GitHub: mythicavalon
- Sponsor: https://www.paypal.com/paypalme/amalnair11/
- LinkedIn: https://www.linkedin.com/in/amal080/