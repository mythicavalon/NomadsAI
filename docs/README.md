# 📚 NomadsAI Documentation

Welcome to the NomadsAI documentation! This directory contains comprehensive guides and information about the platform.

## 📖 Documentation Index

### 🚀 Getting Started
- **[README.md](../README.md)** - Complete project overview and setup guide
- **[HANDOFF_PROMPT.md](../HANDOFF_PROMPT.md)** - Agent handoff documentation
- **[CHANGELOG.md](../CHANGELOG.md)** - Version history and changes

### 🏗️ Architecture & Development
- **Frontend**: Next.js 14 + TypeScript + shadcn/ui + Tailwind CSS
- **Backend**: FastAPI + Python 3.11 + NVIDIA GPT-OSS-120B
- **Deployment**: Vercel (Frontend) + Render (Backend)

### 🔑 Key Features
- **AI-Powered Travel Planning**: Multi-step wizard with intelligent recommendations
- **Modern SaaS Interface**: Professional design optimized for all devices
- **Real-time AI Integration**: NVIDIA's advanced language model for travel intelligence
- **Comprehensive API**: RESTful endpoints for all travel planning needs

## 🎯 Quick Reference

### Development Commands
```bash
# Frontend
cd frontend && npm run dev

# Backend
cd backend && uvicorn app.main:app --reload
```

### Environment Variables
```env
# Frontend
NEXT_PUBLIC_API_BASE=http://localhost:8000

# Backend
NVIDIA_API_KEY=your_nvidia_api_key
CORS_ORIGINS=http://localhost:3000
```

### API Endpoints
- `POST /api/plan` - Generate travel plans
- `GET /api/ai-status` - Check AI service status
- `POST /api/chat` - AI chat interface
- `GET /api/healthz` - Health check

## 📋 Project Status

- **Current Version**: 2.0.0
- **Status**: Production Ready
- **AI Integration**: Fully operational
- **Frontend**: Complete redesign implemented
- **Backend**: Comprehensive API with error handling

## 🤝 Support

- **GitHub Issues**: Report bugs or request features
- **Documentation**: Check this directory for detailed guides
- **Code Quality**: TypeScript + Pydantic for type safety
- **Testing**: Comprehensive error handling and fallbacks

---

**For detailed information, start with the main [README.md](../README.md) file.**