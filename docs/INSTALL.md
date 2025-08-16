# INSTALL — Nomad AI

## Prereqs
- Python 3.11+
- Node.js 18+

## Local setup
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

## Production
Backend (Render)
- Use `render.yaml` to create a web service; root directory: `backend`. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
- Set env: `DATABASE_URL=sqlite:///./nomad_ai.db`, `CORS_ORIGINS=*`.

Backend (Railway)
- Import the repo; Railway will detect `railway.json`.

Frontend (Vercel)
- Import `frontend/` as the project.
- Set `NEXT_PUBLIC_API_BASE` to the Render/Railway backend URL.
- Build command: `npm run build`; Output: default.

## Verify
- Backend: open `/healthz`, `/api/signals`, and POST `/api/itineraries/`.
- Frontend: open `/` and generate an itinerary; test Memory and Digest pages.