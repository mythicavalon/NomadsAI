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
Backend (Render/Railway)
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
- Env: copy `.env.example`, configure SMTP for real emails or rely on file outbox

Frontend (Vercel)
- Set `NEXT_PUBLIC_API_BASE` to backend URL
- Build command: `npm run build`
- Output: Next.js default