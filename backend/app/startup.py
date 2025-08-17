"""
Startup script to initialize pipeline components when FastAPI starts.
"""

import logging
from pathlib import Path
from .pipeline import DataRetriever, DataIngester

logger = logging.getLogger(__name__)

async def initialize_pipeline():
    """Initialize the pipeline components on startup."""
    try:
        logger.info("🚀 Initializing Two-Stage Itinerary Pipeline...")
        
        # Initialize data retriever
        retriever = DataRetriever()
        logger.info("✅ Data retriever initialized")
        
        # Initialize data ingester
        ingester = DataIngester(retriever)
        logger.info("✅ Data ingester initialized")
        
        # Pre-load knowledge for common destinations
        common_destinations = ["london", "paris", "tokyo", "new york", "rome", "barcelona", "amsterdam", "berlin"]
        logger.info(f"📚 Pre-loading knowledge for {len(common_destinations)} destinations...")
        
        for destination in common_destinations:
            try:
                success = ingester.ingest_wikivoyage_data(destination)
                if success:
                    logger.info(f"  ✅ {destination.title()}: Knowledge loaded")
                else:
                    logger.warning(f"  ⚠️ {destination.title()}: Knowledge loading failed")
            except Exception as e:
                logger.warning(f"  ⚠️ {destination.title()}: Error during loading - {e}")
        
        logger.info("🎉 Pipeline initialization completed successfully!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Pipeline initialization failed: {e}")
        return False

def get_pipeline_status():
    """Get the current status of the pipeline."""
    try:
        retriever = DataRetriever()
        return {
            "status": "operational",
            "components": {
                "data_retriever": "ready",
                "data_ingester": "ready"
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "components": {
                "data_retriever": "unknown",
                "data_ingester": "unknown"
            }
        }