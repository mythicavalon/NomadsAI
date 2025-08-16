# Nomad AI Backend (FastAPI)

FastAPI backend powering Nomad AI.

## Quick start

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python uvicorn_main.py
```

App runs at http://localhost:8000

## Endpoints
- GET `/healthz`
- POST `/api/itineraries/` — build itinerary
- GET `/api/signals/` — travel signals from mock data
- GET `/api/memory/` — list memories
- POST `/api/memory/` — create memory
- DELETE `/api/memory/{id}` — delete memory
- POST `/api/digest/send` — send weekly digest (SMTP or file outbox)

## Deployment
- Render/Railway: run command `uvicorn app.main:app --host 0.0.0.0 --port 8000`
- Set environment from `.env.example`