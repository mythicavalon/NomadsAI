"""
Startup script to initialize pipeline components when FastAPI starts.
"""

import logging
from pathlib import Path
from .pipeline import generate_itinerary_pipeline

logger = logging.getLogger(__name__)

async def initialize_pipeline():
    """Initialize the pipeline components on startup."""
    try:
        logger.info("🚀 Initializing Standalone Lightweight Pipeline...")
        
        # Test the pipeline to ensure it's working
        test_result = generate_itinerary_pipeline("London", 1, "New York", "medium", ["culture"])
        
        if test_result and "itinerary" in test_result:
            logger.info("✅ Standalone pipeline initialized successfully")
            logger.info(f"✅ Test itinerary generated: {len(test_result.get('itinerary', []))} days")
        else:
            logger.warning("⚠️ Pipeline test generated incomplete result")
        
        logger.info("🎉 Pipeline initialization completed successfully!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Pipeline initialization failed: {e}")
        return False

def get_pipeline_status():
    """Get the current status of the pipeline."""
    try:
        # Test the pipeline
        test_result = generate_itinerary_pipeline("Paris", 1, "London", "medium", ["food"])
        
        if test_result and "itinerary" in test_result:
            return {
                "status": "operational",
                "components": {
                    "standalone_pipeline": "ready",
                    "knowledge_base": "ready"
                },
                "test_result": "success"
            }
        else:
            return {
                "status": "warning",
                "components": {
                    "standalone_pipeline": "partial",
                    "knowledge_base": "unknown"
                },
                "test_result": "incomplete"
            }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "components": {
                "standalone_pipeline": "unknown",
                "knowledge_base": "unknown"
            },
            "test_result": "failed"
        }