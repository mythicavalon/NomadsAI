# Two-Stage Itinerary Generation Pipeline

This pipeline provides a robust, two-stage approach to generating travel itineraries that combines AI creativity with factual knowledge grounding.

## 🏗️ Architecture

### Stage 1: Skeleton Builder
- Uses GPT-OSS-120B to generate structured JSON itineraries
- Enforces strict schema validation
- Ensures all required fields are populated
- Retries on validation failures

### Stage 2: Knowledge Grounding
- Enriches skeleton with factual data from multiple sources
- Wikivoyage-style curated content
- Local knowledge base
- Event and attraction data
- Smart caching for performance

## 🚀 Usage

### Basic Usage
```python
from app.pipeline import generate_itinerary_pipeline

# Generate a complete itinerary
itinerary = await generate_itinerary_pipeline(
    destination="London",
    days=5,
    from_city="New York",
    budget="luxury",
    interests=["culture", "food", "history"]
)
```

### Advanced Usage
```python
from app.pipeline import ItineraryPipeline

# Initialize pipeline with custom settings
pipeline = ItineraryPipeline(
    base_url="https://custom-llm.com",
    api_key="your-api-key",
    model="gpt-oss-120b"
)

# Generate itinerary
itinerary = await pipeline.generate_itinerary(
    destination="Paris",
    days=3,
    from_city="London",
    budget="medium",
    interests=["art", "food"]
)
```

## 📊 Output Schema

```json
{
  "summary": "Your 5-day journey from New York to London",
  "itinerary": [
    {
      "day": 1,
      "theme": "Day 1: London introduction and cultural immersion",
      "activities": [
        "Visit the British Museum",
        "Explore Covent Garden",
        "Evening at West End Theatre"
      ],
      "highlights": [
        "British Museum - World's greatest collections",
        "Covent Garden - Historic market and entertainment"
      ],
      "cultural_insight": "London is a global city with rich cultural heritage...",
      "local_secrets": "Explore authentic experiences beyond tourist spots...",
      "travel_tips": "Use Oyster card for transport, many museums are free..."
    }
  ],
  "estimated_budget": "luxury",
  "ai_provider": "Two-Stage Pipeline + GPT-OSS",
  "pipeline_info": {
    "stages_completed": ["skeleton_builder", "knowledge_enrichment"],
    "skeleton_validation": true,
    "enrichment_success": true
  }
}
```

## 🔧 Configuration

### Environment Variables
- `PIPELINE_DB_PATH`: Path to embeddings database (default: `data/embeddings.db`)
- `PIPELINE_CACHE_TTL`: Cache TTL in hours (default: 24)

### Dependencies
```bash
pip install jsonschema sentence-transformers numpy
```

## 📈 Performance

- **Stage 1**: ~1-2 seconds (AI generation + validation)
- **Stage 2**: ~0.5-1 second (knowledge enrichment)
- **Total**: ~2-5 seconds for complete itinerary
- **Caching**: Subsequent queries for same destination are faster

## 🛡️ Reliability Features

- **Schema Validation**: Ensures consistent output structure
- **Retry Logic**: Multiple attempts on AI generation failures
- **Fallback Generation**: Always returns a valid itinerary
- **Error Handling**: Graceful degradation on component failures
- **Knowledge Fallbacks**: Rich content even when external sources fail

## 🔍 Monitoring

### Health Check Endpoint
```bash
GET /api/pipeline-status
```

### Pipeline Info in Response
Every itinerary includes `pipeline_info` showing:
- Stages completed
- Validation status
- Processing time
- Any errors encountered

## 🚀 Deployment

The pipeline automatically initializes on FastAPI startup:
- Pre-loads knowledge for common destinations
- Initializes embeddings database
- Sets up caching layer
- Ready to serve requests immediately

## 📝 Adding New Destinations

```python
from app.pipeline import add_custom_knowledge_pipeline

# Add custom knowledge
success = add_custom_knowledge_pipeline(
    destination="singapore",
    topic="cultural_insight",
    content="Singapore is a modern city-state with diverse cultural influences..."
)
```

## 🧪 Testing

Run the test script to verify pipeline functionality:
```bash
cd backend
python test_pipeline.py
```

## 🔮 Future Enhancements

- Integration with real Wikivoyage API
- TripAdvisor review data ingestion
- User feedback learning
- Multi-language support
- Advanced semantic search
- Real-time data updates