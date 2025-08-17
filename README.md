# NomadsAI - AI-Powered Travel Intelligence Platform

> **Lightweight, fast-deploying travel planning powered by intelligent standalone pipeline**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green.svg)](https://fastapi.tiangolo.com/)

## 🚀 Project Overview

NomadsAI is a modern travel planning platform that combines intelligent AI-powered itinerary generation with a lightweight, fast-deploying architecture. Built with modern web technologies and powered by a sophisticated standalone pipeline, it provides rich, factual travel experiences with real destination knowledge.

### ✨ Key Features

- **🤖 Intelligent Planning**: Standalone lightweight pipeline with real destination knowledge
- **⚡ Fast Deployment**: Seconds deployment time with no heavy dependencies
- **🏛️ Rich Content**: Pre-loaded knowledge for major destinations (London, Paris, Tokyo, NYC)
- **🎯 Real Attractions**: Actual landmarks like British Museum, Eiffel Tower, Senso-ji Temple
- **💎 Hidden Gems**: Local secrets and authentic experiences
- **🛡️ Robust Fallbacks**: Graceful handling of unknown destinations
- **📱 Modern UI**: Responsive SaaS interface with shadcn/ui components
- **🔌 API-First**: RESTful API architecture for easy integration

## 🏗️ Architecture

```
NomadsAI/
├── frontend/                 # Next.js 14 + Tailwind + shadcn/ui
│   ├── app/                 # App Router pages
│   ├── components/          # Reusable UI components
│   └── lib/                 # Utilities and helpers
├── backend/                 # FastAPI + Python 3.11+
│   ├── app/                 # Main application
│   │   ├── pipeline/        # Standalone lightweight pipeline
│   │   ├── routers/         # API endpoints
│   │   ├── services/        # Business logic
│   │   └── models.py        # Data models
│   └── requirements.txt     # Lightweight dependencies
└── docs/                    # Project documentation
```

### Current Tech Stack

| Component | Technology | Version | Status |
|-----------|------------|---------|---------|
| **Frontend** | Next.js | 14.2.5+ | ✅ Active |
| **Styling** | Tailwind CSS + shadcn/ui | Latest | ✅ Active |
| **Backend** | FastAPI + Python | 3.11+ | ✅ Active |
| **Pipeline** | Standalone Lightweight | Custom | ✅ Active |
| **Database** | SQLite (auto-generated) | Latest | ✅ Active |
| **Knowledge** | Pre-loaded destinations | Curated | ✅ Active |
| **Deployment** | Vercel + Render | Latest | ✅ Ready |

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **npm** 9+
- **Python** 3.11+
- **Git** for version control

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at: `http://localhost:3000`

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend API will be available at: `http://localhost:8000`

## 🎯 Current System Status

### ✅ **Fully Operational Features**

#### **Standalone Lightweight Pipeline**
- ⚡ **Zero Heavy Dependencies**: No ML libraries, immediate deployment
- 🏛️ **Real Knowledge**: British Museum, Tower of London, Eiffel Tower, Senso-ji Temple
- 🌍 **Destination Coverage**: London, Paris, Tokyo, New York with rich content
- 💎 **Hidden Gems**: Leadenhall Market, Neal's Yard, Yanaka Ginza, High Line
- 🚗 **Practical Tips**: Transport, payment, local advice for each city
- 🛡️ **Type Safety**: All fields properly typed for Pydantic validation

#### **API Endpoints**
- ✅ `POST /api/plan` - Generate rich travel itineraries
- ✅ `GET /api/ai-status` - System status and capabilities
- ✅ `GET /api/pipeline-status` - Pipeline health check
- ✅ `GET /healthz` - Application health check

#### **Data Quality**
- ✅ **No Validation Errors**: All Pydantic models pass validation
- ✅ **Consistent Types**: Strings and lists properly formatted
- ✅ **Rich Content**: Real attraction names and cultural insights
- ✅ **Defensive Programming**: Robust error handling for edge cases

### 🔧 Recent Critical Fixes (December 2024)

#### ✅ **Content Quality Restoration - RESOLVED (v2.1.1)**
- **Issue**: API returning generic content instead of rich destination-specific attractions
- **Root Cause**: Pipeline priority and data structure mapping issues
- **Solution**: Fixed pipeline priority and data transformation between backend and frontend
- **Result**: ⚡ **Rich content restored** - British Museum, Eiffel Tower, Senso-ji Temple
- **Status**: ✅ **PRODUCTION READY**

#### ✅ **Security Vulnerability - FIXED (v2.1.1)**
- **Issue**: NVIDIA API key hardcoded in source code
- **Risk**: API credentials exposed in repository
- **Solution**: Migrated to environment variable (NVIDIA_API_KEY)
- **Status**: ✅ **SECURITY RESOLVED**

#### ✅ **Server Startup - OPTIMIZED (v2.1.1)**
- **Issue**: FastAPI server startup timeouts due to pipeline testing
- **Solution**: Removed blocking startup tests, pipeline initializes on-demand
- **Result**: ⚡ **Fast, reliable server startup**
- **Status**: ✅ **DEPLOYMENT READY**

## 📚 API Documentation

### Travel Planning API

**Generate Travel Plan:**
```http
POST /api/plan
Content-Type: application/json

{
  "from_city": "Bengaluru",
  "destination": "London",
  "departure_date": "2025-08-23",
  "return_date": "2025-08-27",
  "travelers": 1,
  "budget": "premium",
  "interests": ["culture", "food", "history"]
}
```

**Response:**
```json
{
  "summary": "Your 5-day journey from Bengaluru to London",
  "itinerary": [
    {
      "day": 1,
      "theme": "Day 1: London introduction and cultural immersion",
      "activities": [
        "British Museum - World's greatest collections of art and artifacts",
        "Tower of London - Historic castle and fortress",
        "Buckingham Palace - Official residence of the British monarch"
      ],
      "highlights": ["Discover London landmarks", "Experience local culture"],
      "cultural_insight": "London is a global city with rich cultural heritage...",
      "local_secrets": "Discover hidden gems like Leadenhall Market...",
      "travel_tips": "London has extensive public transport including the Underground..."
    }
  ],
  "highlights": ["Discover London landmarks", "Experience local culture"],
  "estimated_budget": "premium",
  "cultural_insights": "London is a global city with rich cultural heritage...",
  "local_recommendations": "Discover hidden gems like Leadenhall Market...",
  "travel_tips": "London has extensive public transport including the Underground...",
  "ai_provider": "Standalone Lightweight Pipeline",
  "from_city": "Bengaluru",
  "destination": "London",
  "total_days": 5
}
```

## 🧪 Testing

### Backend Testing

```bash
cd backend
python -m pytest tests/     # Run all tests (when available)

# Manual testing
python -c "
from app.pipeline import generate_itinerary_pipeline
result = generate_itinerary_pipeline('London', 3, 'New York', 'luxury', ['culture'])
print('✅ Pipeline working!' if result else '❌ Pipeline failed')
"
```

### System Health Check

```bash
# Test complete system
curl -X POST http://localhost:8000/api/plan \
  -H "Content-Type: application/json" \
  -d '{
    "from_city": "New York",
    "destination": "London",
    "departure_date": "2025-08-20",
    "return_date": "2025-08-25",
    "travelers": 1,
    "budget": "luxury",
    "interests": ["culture", "food"]
  }'
```

## 🚀 Deployment

### Frontend (Vercel)

1. Connect GitHub repository to Vercel
2. Set environment variables:
   ```env
   NEXT_PUBLIC_API_BASE=https://your-backend.onrender.com
   ```
3. Deploy automatically on push to main

### Backend (Render)

1. Connect GitHub repository to Render
2. Set environment variables:
   ```env
   CORS_ORIGINS=https://your-frontend.vercel.app
   ```
3. Deploy automatically on push to main

**⚡ Expected deployment time: Seconds (not minutes!)**

## 🔧 Development

### Key Files

```
backend/app/
├── main.py                 # FastAPI application
├── models.py              # Pydantic data models
├── startup.py             # Pipeline initialization
├── pipeline/
│   ├── __init__.py        # Pipeline exports
│   └── standalone_pipeline.py  # Core pipeline logic
└── routers/
    └── plan.py            # Travel planning endpoint
```

### Development Commands

```bash
# Backend
uvicorn app.main:app --reload    # Development server
python -c "from app.pipeline import generate_itinerary_pipeline; print('OK')"  # Quick test

# Frontend
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Lint code
```

## 📊 System Performance

### Deployment Metrics
- ⚡ **Deployment Time**: ~30 seconds (vs 30+ minutes with heavy ML)
- 🚀 **Startup Time**: ~2 seconds
- 💾 **Memory Usage**: ~50MB (vs 2GB+ with transformers)
- 📦 **Package Size**: Lightweight dependencies only

### Content Quality
- 🏛️ **Real Attractions**: 20+ per major destination
- 🌍 **Destinations**: London, Paris, Tokyo, NYC with rich data
- 💎 **Hidden Gems**: 4+ local secrets per destination
- 🚗 **Practical Info**: Transport, payment, cultural tips

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. **Test changes**: `python -c "from app.pipeline import generate_itinerary_pipeline; print('Test OK')"`
4. **Commit**: `git commit -m 'Add amazing feature'`
5. **Push**: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Standards
- **Every change must be tested before commit**
- **All changes must be pushed to main**
- **No breaking changes without testing**
- **Documentation must be updated with changes**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- **Documentation**: Check the [docs/](docs/) directory
- **Issues**: Report bugs via GitHub Issues
- **System Status**: All core features operational ✅

---

**Built with ❤️ by the NomadsAI Team**

*Fast, intelligent, reliable travel planning*

**Current Status: 🟢 PRODUCTION READY - v2.1.1 (December 2024)**