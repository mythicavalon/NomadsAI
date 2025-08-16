# Changelog

All notable changes to this project will be documented here.

## 0.5.0 — Faculty-inspired UI + UX polish (current)
- Frontend: Faculty-style theme (deep navy/green, off-white, warm accent gold), Inter + Merriweather fonts
- Hero header and refined tabs (Chat | Itinerary | Nomad Tools)
- Modern chat UI: elegant bubbles, sticky input, suggestion chips, responsive layout
- Nomad Tools placeholder cards (Cost Calculator, Visa Info, Coworking Map)

## 0.4.0 — User-provided GPT + LLM itineraries
- Settings page to store GPT base URL/API key/model in localStorage
- Backend accepts per-request GPT overrides for chat and itineraries
- Itinerary generation via LLM using Wikipedia context for any city

## 0.3.0 — Online AI + Retrieval
- Added DuckDuckGo search integration for live signals/news
- Online mode toggle in UI; signals and itinerary endpoints accept `online_mode`
- Chat endpoint uses GPT-OSS when configured; offline synthesis fallback remains
- Expanded mock data and filtered past events
- Frontend: hero, city cards, chat page, improved styling

## 0.2.0 — Knowledge-based itineraries
- City knowledge base (Barcelona, Tokyo, New Orleans)
- Varied per-day activities from knowledge + events
- Surprise picks from hidden gems

## 0.1.0 — MVP
- FastAPI backend with itineraries, signals, memory, digest
- Next.js frontend with itinerary builder, signals, memory, digest
- Mock data offline support
- CI, tests, deployment configs