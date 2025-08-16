# Nomad AI — Your AI-powered travel companion

Build smarter itineraries, discover hidden gems, and catch real-time travel signals with GPT-OSS.

- Backend: FastAPI (Python 3.11)
- Frontend: Next.js 14 + TailwindCSS
- Deployment: Backend on Render/Railway, Frontend on Vercel
- No paid APIs; offline mock data included

## Monorepo Structure
- `backend/` — FastAPI service with mock data and SQLite Memory Journal
- `frontend/` — Next.js app with itinerary builder, signals, surprise mode, memory journal
- `docs/` — GTM assets and setup

## Local Development
Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python uvicorn_main.py
```
Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Deployment
- Backend: Deploy on Render or Railway with start command `uvicorn app.main:app --host 0.0.0.0 --port 8000`
- Frontend: Deploy on Vercel; set `NEXT_PUBLIC_API_BASE` to backend URL

## Live Demo
- Frontend: <Vercel URL>
- Backend: <Render URL>

## GTM
- See `docs/growth.md` for 5-step GTM, ICPs, and outreach templates.
- See `docs/roadmap.md` for scaling vision.

## Screenshots
Place screenshots in `docs/screenshots/` after deployment for the repo landing.

## Branding / Meta
- GitHub: mythicavalon
- Sponsor: https://www.paypal.com/paypalme/amalnair11/
- LinkedIn: https://www.linkedin.com/in/amal080/