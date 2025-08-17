# NomadsAI Backend - Standalone Pipeline System

FastAPI backend powering NomadsAI with lightweight standalone pipeline for intelligent travel planning.

## 🚀 **Current System Status: PRODUCTION READY**

- ✅ **Standalone Pipeline**: Zero external dependencies, fast deployment
- ✅ **Real Knowledge**: Pre-loaded data for London, Paris, Tokyo, NYC
- ✅ **Type Safety**: All Pydantic validation passing
- ✅ **Deployment Time**: ~30 seconds (vs 30+ minutes with ML)
- ✅ **Memory Usage**: ~50MB (vs 2GB+ with transformers)

## Quick Start

```bash
# Setup environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies (lightweight)
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at: `http://localhost:8000`  
API docs available at: `http://localhost:8000/docs`

## 🔧 Architecture

### Core Components

```
app/
├── main.py                 # FastAPI application setup
├── models.py              # Pydantic data models
├── startup.py             # Pipeline initialization
├── pipeline/              # Standalone pipeline system
│   ├── __init__.py        # Pipeline exports
│   └── standalone_pipeline.py  # Core pipeline logic
├── routers/               # API endpoints
│   ├── plan.py           # Travel planning (main endpoint)
│   ├── chat.py           # AI chat interface
│   ├── itineraries.py    # Legacy itinerary endpoint
│   └── ...               # Other endpoints
└── services/              # Business logic services
```

### Standalone Pipeline Features

- **🏛️ Real Attractions**: British Museum, Tower of London, Eiffel Tower, Senso-ji Temple
- **💎 Hidden Gems**: Leadenhall Market, Neal's Yard, Yanaka Ginza, High Line
- **🚗 Practical Info**: Transport, payment, cultural tips for each destination
- **🛡️ Robust Fallbacks**: Handles unknown destinations gracefully
- **⚡ Fast Generation**: <1 second response time

## 📚 API Endpoints

### Core Endpoints

| Endpoint | Method | Description | Status |
|----------|--------|-------------|---------|
| `POST /api/plan` | POST | **Generate travel itinerary** | ✅ Active |
| `GET /api/ai-status` | GET | AI service status | ✅ Active |
| `GET /api/pipeline-status` | GET | Pipeline health check | ✅ Active |
| `GET /healthz` | GET | Application health | ✅ Active |

### Legacy Endpoints (Maintained)

| Endpoint | Method | Description | Status |
|----------|--------|-------------|---------|
| `POST /api/itineraries/` | POST | Legacy itinerary builder | ✅ Active |
| `POST /api/chat` | POST | AI chat interface | ✅ Active |
| `GET /api/memory/` | GET | List memories | ✅ Active |
| `POST /api/memory/` | POST | Create memory | ✅ Active |
| `DELETE /api/memory/{id}` | DELETE | Delete memory | ✅ Active |
| `POST /api/digest/send` | POST | Send weekly digest | ✅ Active |

## 🎯 Main API Usage

### Travel Planning Request

```bash
curl -X POST http://localhost:8000/api/plan \
  -H "Content-Type: application/json" \
  -d '{
    "from_city": "Bengaluru",
    "destination": "London", 
    "departure_date": "2025-08-23",
    "return_date": "2025-08-27",
    "travelers": 1,
    "budget": "premium",
    "interests": ["culture", "food", "history"]
  }'
```

### Response Structure

```json
{
  "summary": "Your 5-day journey from Bengaluru to London",
  "itinerary": [
    {
      "day": 1,
      "theme": "Day 1: London introduction and cultural immersion",
      "activities": [
        "British Museum - World's greatest collections of art and artifacts",
        "Tower of London - Historic castle and fortress"
      ],
      "highlights": ["Discover London landmarks", "Experience local culture"],
      "cultural_insight": "London is a global city with rich cultural heritage...",
      "local_secrets": "Discover hidden gems like Leadenhall Market...",
      "travel_tips": "London has extensive public transport including the Underground..."
    }
  ],
  "highlights": ["Discover London landmarks", "Experience local culture"],
  "estimated_budget": "premium",
  "cultural_insights": "London is a global city...",
  "local_recommendations": "Discover hidden gems...",
  "travel_tips": "London has extensive public transport...",
  "ai_provider": "Standalone Lightweight Pipeline",
  "total_days": 5
}
```

## 🧪 Testing

### Quick Test

```bash
# Test pipeline directly
python -c "
from app.pipeline import generate_itinerary_pipeline
result = generate_itinerary_pipeline('London', 3, 'New York', 'luxury', ['culture'])
print('✅ Pipeline working!' if result else '❌ Pipeline failed')
"
```

### Full System Test

```bash
# Test complete API
python -c "
import requests
import json

response = requests.post('http://localhost:8000/api/plan', 
  json={
    'from_city': 'New York',
    'destination': 'London',
    'departure_date': '2025-08-20',
    'return_date': '2025-08-25',
    'travelers': 1,
    'budget': 'luxury',
    'interests': ['culture', 'food']
  }
)

if response.status_code == 200:
    data = response.json()
    print('✅ API working!')
    print(f'Generated {data[\"total_days\"]} day itinerary')
    print(f'AI Provider: {data[\"ai_provider\"]}')
else:
    print(f'❌ API failed: {response.status_code}')
"
```

## 🚀 Deployment

### Production Deployment (Render)

```bash
# Build command (automatic)
pip install -r requirements.txt

# Start command
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Environment Variables

```env
# Optional - CORS configuration
CORS_ORIGINS=https://your-frontend.vercel.app

# Optional - Custom settings
LOG_LEVEL=INFO
```

### Performance Expectations

- **🚀 Startup Time**: ~2 seconds
- **⚡ Deployment Time**: ~30 seconds
- **💾 Memory Usage**: ~50MB
- **🔄 Response Time**: <1 second per itinerary

## 🛠️ Development

### Dependencies

Current `requirements.txt` includes only lightweight dependencies:
- `fastapi==0.115.0` - Web framework
- `uvicorn[standard]==0.30.6` - ASGI server  
- `pydantic==2.8.2` - Data validation
- `sqlmodel==0.0.22` - Database ORM
- `requests==2.32.3` - HTTP client
- No heavy ML libraries ✅

### Development Commands

```bash
# Start development server
uvicorn app.main:app --reload

# Test pipeline
python -c "from app.pipeline import generate_itinerary_pipeline; print('OK')"

# Check system status
curl http://localhost:8000/api/pipeline-status
```

### Code Structure

- **Pipeline Logic**: `app/pipeline/standalone_pipeline.py`
- **API Routes**: `app/routers/plan.py`
- **Data Models**: `app/models.py`
- **Startup**: `app/startup.py`

## 📊 System Monitoring

### Health Checks

```bash
# Application health
curl http://localhost:8000/healthz

# Pipeline status
curl http://localhost:8000/api/pipeline-status

# AI service status  
curl http://localhost:8000/api/ai-status
```

### Expected Responses

```json
// /healthz
{"status": "ok"}

// /api/pipeline-status
{
  "status": "operational",
  "components": {
    "standalone_pipeline": "ready",
    "knowledge_base": "ready"
  },
  "test_result": "success"
}
```

## 🔧 Troubleshooting

### Common Issues

**Issue**: Import errors  
**Solution**: Check Python version (3.11+ required)

**Issue**: Pipeline not working  
**Solution**: Check if SQLite database is created in `data/` directory

**Issue**: Validation errors  
**Solution**: All current validation issues are resolved ✅

### Debug Commands

```bash
# Check Python version
python --version

# Test imports
python -c "from app.main import app; print('Imports OK')"

# Check pipeline
python -c "from app.startup import get_pipeline_status; print(get_pipeline_status())"
```

## 📝 Recent Updates

### v2.1.0 - Critical Fixes Applied ✅

- **Fixed**: Pydantic validation errors (cultural_insights, travel_tips)
- **Optimized**: Deployment time reduced from 30+ minutes to ~30 seconds
- **Enhanced**: Defensive programming for robust error handling
- **Added**: Type safety throughout the pipeline
- **Status**: 🟢 **PRODUCTION READY**

---

**Built with ❤️ for fast, reliable travel planning**

**Status**: 🟢 **All systems operational**