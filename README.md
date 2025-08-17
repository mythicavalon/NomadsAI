# NomadsAI - AI-Powered Travel Intelligence Platform

> **Enterprise-grade travel planning powered by NVIDIA's advanced AI technology**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com/)

## 🚀 Project Overview

NomadsAI is a sophisticated travel planning platform that combines cutting-edge AI technology with enterprise-grade architecture to deliver personalized travel experiences. Built with modern web technologies and powered by NVIDIA's GPT-OSS-120B model, it provides intelligent, secure, and scalable travel planning solutions.

### ✨ Key Features

- **🤖 AI-Powered Planning**: NVIDIA GPT-OSS-120B integration for intelligent itinerary generation
- **🎯 Multi-Step Planning**: Intuitive wizard interface for comprehensive travel planning
- **🏢 Enterprise Security**: Built with security and scalability in mind
- **📱 Responsive Design**: Modern SaaS interface optimized for all devices
- **🔌 API-First**: RESTful API architecture for easy integration
- **📊 Real-time Intelligence**: Dynamic travel recommendations and insights

## 🏗️ Architecture

```
NomadsAI/
├── frontend/                 # Next.js 14 + Tailwind + shadcn/ui
│   ├── app/                 # App Router pages
│   ├── components/          # Reusable UI components
│   └── lib/                 # Utilities and helpers
├── backend/                 # FastAPI + Python 3.11+
│   ├── app/                 # Main application
│   ├── routers/             # API endpoints
│   ├── services/            # Business logic and AI integration
│   └── utils/               # Helper functions
└── docs/                    # Project documentation
```

### Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Frontend** | Next.js | 14.2.5+ |
| **Styling** | Tailwind CSS + shadcn/ui | Latest |
| **Backend** | FastAPI + Python | 3.11+ |
| **AI Engine** | NVIDIA GPT-OSS-120B | Latest |
| **Database** | SQLModel + SQLite | Latest |
| **Deployment** | Vercel (Frontend) + Render (Backend) | - |

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

### Environment Variables

Create `.env` files in both frontend and backend directories:

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

**Backend (.env):**
```env
NVIDIA_API_KEY=your_nvidia_api_key_here
CORS_ORIGINS=http://localhost:3000
```

## 📚 API Documentation

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `POST /api/plan` | POST | Generate AI travel plan |
| `GET /api/ai-status` | GET | Check AI service status |
| `POST /api/chat` | POST | AI chat interface |
| `GET /api/healthz` | GET | Health check |

### Travel Planning API

**Generate Travel Plan:**
```http
POST /api/plan
Content-Type: application/json

{
  "from_city": "New York",
  "destination": "Tokyo",
  "departure_date": "2025-08-20",
  "return_date": "2025-08-28",
  "travelers": 1,
  "budget": "premium",
  "interests": ["culture", "food", "adventure"]
}
```

**Response:**
```json
{
  "summary": "Your 9-day journey from New York to Tokyo",
  "itinerary": [...],
  "highlights": [...],
  "estimated_budget": "Premium",
  "cultural_insights": "...",
  "local_recommendations": "...",
  "travel_tips": "...",
  "ai_provider": "NVIDIA GPT-OSS-120B"
}
```

## 🔧 Development

### Project Structure

```
frontend/
├── app/                     # Next.js App Router
│   ├── page.tsx            # Landing page with travel planner
│   ├── results/            # Travel plan results page
│   ├── chat/               # AI chat interface
│   └── globals.css         # Global styles and design system
├── components/              # Reusable components
│   ├── ui/                 # shadcn/ui components
│   └── ...                 # Custom components
└── lib/                    # Utilities and helpers

backend/
├── app/
│   ├── main.py             # FastAPI application setup
│   ├── models.py           # Pydantic data models
│   ├── routers/            # API route handlers
│   │   ├── plan.py         # Travel planning endpoint
│   │   ├── chat.py         # Chat functionality
│   │   └── ...             # Other endpoints
│   ├── services/           # Business logic
│   │   ├── gpt_oss.py      # NVIDIA AI integration
│   │   ├── llm_client.py   # LLM client management
│   │   └── ...             # Other services
│   └── utils/              # Helper functions
```

### Key Components

#### Frontend Components

- **Travel Planner Wizard**: Multi-step form for travel preferences
- **Results Page**: Beautiful display of AI-generated travel plans
- **Design System**: Consistent UI using shadcn/ui and Tailwind CSS
- **Responsive Layout**: Mobile-first design approach

#### Backend Services

- **AI Integration**: NVIDIA GPT-OSS-120B for intelligent planning
- **Data Validation**: Pydantic models for request/response validation
- **Error Handling**: Comprehensive error handling and fallbacks
- **API Security**: CORS configuration and input validation

### Development Commands

```bash
# Frontend
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Lint code
npm run type-check   # TypeScript check

# Backend
uvicorn app.main:app --reload    # Development server
python -m pytest                 # Run tests
python -m black .                # Format code
```

## 🚀 Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Render)

1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

**Frontend:**
```env
NEXT_PUBLIC_API_BASE=https://your-backend.onrender.com
```

**Backend:**
```env
NVIDIA_API_KEY=your_production_nvidia_api_key
CORS_ORIGINS=https://your-frontend.vercel.app
```

## 🧪 Testing

### Frontend Testing

```bash
cd frontend
npm run test        # Run tests
npm run test:watch  # Watch mode
```

### Backend Testing

```bash
cd backend
python -m pytest tests/     # Run all tests
python -m pytest -v         # Verbose output
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style

- **Frontend**: ESLint + Prettier configuration
- **Backend**: Black + isort for Python formatting
- **Commits**: Conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- **Documentation**: Check the [docs/](docs/) directory
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Join the conversation in GitHub Discussions

## 🔗 Links

- **Live Demo**: [Your deployed frontend URL]
- **API Docs**: [Your deployed backend URL]/docs
- **GitHub**: [Your repository URL]

---

**Built with ❤️ by the NomadsAI Team**

*Empowering travelers with AI-driven intelligence*