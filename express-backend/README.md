# NomadAI — OpenAI-compatible Backend (Node.js/Express)

This service exposes `/v1/chat/completions` compatible with OpenAI’s Chat Completions API, and always prepends a system message from `SYSTEM_PROMPT`.

## Features
- OpenAI-compatible request/response for chat completions
- System prompt prepended to every request
- Conditional Authorization header (omitted if `OPENAI_API_KEY` is `none` or missing)
- Ready for Render deployment

## Setup
```bash
cd express-backend
cp .env.example .env
npm install
npm start
```
Server runs on http://localhost:8001

## Environment (.env)
- OPENAI_API_KEY: your key, or `none` for open-weight backends (omits Authorization header)
- OPENAI_BASE_URL: e.g., https://api.openai.com or an OpenAI-compatible endpoint (OpenRouter, vLLM, LM Studio, Ollama)
- OPENAI_MODEL: default model if not specified by client
- SYSTEM_PROMPT: text for the system message prepended to chats
- CORS_ORIGINS: `*` or comma-separated origins
- PORT: default 8001

## API
- POST `/v1/chat/completions`
  - Accepts the same JSON payload as OpenAI’s Chat Completions
  - returns JSON in the same shape
  - Example minimal payload:
```json
{
  "model": "gpt-4o-mini",
  "messages": [
    {"role":"user","content":"Hello!"}
  ]
}
```

## Test with curl
```bash
curl -sS http://localhost:8001/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"Plan 1-day in Kyoto"}]}' | jq
```

## Deploy to Render
- New Web Service → Connect GitHub → Root Directory: `express-backend`
- Environment:
  - OPENAI_API_KEY (or `none`)
  - OPENAI_BASE_URL (e.g., https://openrouter.ai/api/v1)
  - OPENAI_MODEL (e.g., meta-llama/Meta-Llama-3.1-8B-Instruct)
  - SYSTEM_PROMPT (your NomadAI prompt)
  - PORT = 8001
- Build: `npm install`
- Start: `npm start`
- Health Check: `/healthz`

## Notes
- Streaming is proxied as non-streaming in this minimal version. You can extend to stream SSE by piping the upstream response through to the client.