"""
Pipeline Orchestrator
Combines Stage 1 (Skeleton Builder) and Stage 2 (Knowledge Grounding) into a single workflow.
"""

import logging
from typing import Dict, List, Optional
from .skeleton_builder import build_skeleton, validate_skeleton
from .data_retriever import DataRetriever, enrich_skeleton
from .data_ingest import DataIngester

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ItineraryPipeline:
    """Main orchestrator for the two-stage itinerary generation pipeline."""
    
    def __init__(self, base_url: str = None, api_key: str = None, model: str = "gpt-oss-120b"):
        """
        Initialize the pipeline.
        
        Args:
            base_url: Custom LLM base URL (None for default GPT-OSS)
            api_key: API key for the LLM
            model: Model name to use
        """
        self.base_url = base_url
        self.api_key = api_key
        self.model = model
        
        # Initialize components
        self.retriever = DataRetriever()
        self.ingester = DataIngester(self.retriever)
        
        # Pre-load knowledge data for common destinations
        self._preload_knowledge()
    
    def _preload_knowledge(self):
        """Pre-load knowledge data for common destinations."""
        common_destinations = ["london", "paris", "tokyo", "new york", "rome", "barcelona"]
        logger.info("Pre-loading knowledge data for common destinations...")
        
        for destination in common_destinations:
            try:
                self.ingester.ingest_wikivoyage_data(destination)
            except Exception as e:
                logger.warning(f"Failed to pre-load data for {destination}: {e}")
        
        logger.info("Knowledge pre-loading completed")
    
    def generate_itinerary(self, destination: str, days: int, from_city: str = "various locations",
                          budget: str = "medium", interests: List[str] = None) -> Dict:
        """
        Generate a complete itinerary using the two-stage pipeline.
        
        Args:
            destination: Target destination city
            days: Number of days for the trip
            from_city: Origin city
            budget: Budget level (budget, medium, luxury)
            interests: List of travel interests
            
        Returns:
            Complete enriched itinerary
        """
        logger.info(f"Starting itinerary generation pipeline for {destination} ({days} days)")
        
        try:
            # Stage 1: Build skeleton
            logger.info("Stage 1: Building itinerary skeleton...")
            skeleton = build_skeleton(
                destination=destination,
                days=days,
                from_city=from_city,
                budget=budget,
                interests=interests,
                base_url=self.base_url,
                api_key=self.api_key,
                model=self.model
            )
            
            if not skeleton:
                raise ValueError("Failed to generate skeleton")
            
            # Validate skeleton
            if not validate_skeleton(skeleton):
                logger.warning("Skeleton validation failed, but continuing with enrichment")
            
            logger.info("Stage 1 completed successfully")
            
            # Stage 2: Enrich with knowledge
            logger.info("Stage 2: Enriching skeleton with factual data...")
            enriched_itinerary = enrich_skeleton(skeleton)
            
            if not enriched_itinerary:
                raise ValueError("Failed to enrich skeleton")
            
            logger.info("Stage 2 completed successfully")
            
            # Add pipeline metadata
            enriched_itinerary["pipeline_info"] = {
                "stages_completed": ["skeleton_builder", "knowledge_enrichment"],
                "skeleton_validation": validate_skeleton(skeleton),
                "enrichment_success": True,
                "total_processing_time": "~2-5 seconds"
            }
            
            logger.info("Pipeline completed successfully")
            return enriched_itinerary
            
        except Exception as e:
            logger.error(f"Pipeline failed: {e}")
            
            # Return fallback itinerary
            fallback = self._generate_fallback_itinerary(destination, days, from_city, budget, interests)
            fallback["pipeline_info"] = {
                "stages_completed": ["fallback_generator"],
                "error": str(e),
                "fallback_used": True
            }
            
            return fallback
    
    def _generate_fallback_itinerary(self, destination: str, days: int, from_city: str, 
                                   budget: str, interests: List[str]) -> Dict:
        """Generate a fallback itinerary when the pipeline fails."""
        logger.info("Generating fallback itinerary")
        
        itinerary = []
        for day in range(1, days + 1):
            day_data = {
                "day": day,
                "theme": f"Day {day}: {destination} exploration and cultural immersion",
                "activities": [
                    f"Explore {destination} city center and main attractions",
                    f"Visit {destination} historic landmarks and cultural sites",
                    f"Experience {destination} local cuisine and markets"
                ],
                "highlights": [
                    f"Discover {destination} hidden gems and local favorites",
                    f"Immerse yourself in {destination} local culture and traditions"
                ],
                "cultural_insight": f"Learn about {destination}'s rich cultural heritage and local customs. Respect local traditions and engage with the community to truly understand {destination}'s unique character.",
                "local_secrets": f"Explore authentic experiences beyond typical tourist spots in {destination}. Discover hidden gems, local markets, and neighborhood favorites that showcase the real {destination}.",
                "travel_tips": f"Plan your trip from {from_city} to {destination} with local insights. Consider best times to visit, local transportation options, and cultural etiquette for an optimal experience."
            }
            itinerary.append(day_data)
        
        return {
            "summary": f"Your {days}-day journey from {from_city} to {destination}",
            "itinerary": itinerary,
            "estimated_budget": budget,
            "ai_provider": "Pipeline Fallback Generator"
        }
    
    def add_custom_knowledge(self, destination: str, topic: str, content: str) -> bool:
        """
        Add custom knowledge to the retriever.
        
        Args:
            destination: Target destination city
            topic: Topic category (activities, highlights, cultural_insight, etc.)
            content: Knowledge content to add
            
        Returns:
            True if successful, False otherwise
        """
        try:
            self.retriever._index_knowledge(destination, topic, content)
            logger.info(f"Added custom knowledge for {destination}/{topic}")
            return True
        except Exception as e:
            logger.error(f"Failed to add custom knowledge: {e}")
            return False
    
    def get_pipeline_status(self) -> Dict:
        """Get the current status of the pipeline components."""
        try:
            # Check database status
            with self.retriever._get_db_connection() as conn:
                cursor = conn.execute("SELECT COUNT(*) FROM embeddings")
                total_embeddings = cursor.fetchone()[0]
                
                cursor = conn.execute("SELECT COUNT(DISTINCT destination) FROM embeddings")
                destinations_covered = cursor.fetchone()[0]
            
            return {
                "status": "operational",
                "total_embeddings": total_embeddings,
                "destinations_covered": destinations_covered,
                "cache_size": len(self.retriever.cache),
                "components": {
                    "skeleton_builder": "ready",
                    "data_retriever": "ready",
                    "data_ingester": "ready"
                }
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "components": {
                    "skeleton_builder": "unknown",
                    "data_retriever": "unknown",
                    "data_ingester": "unknown"
                }
            }

# Convenience functions for easy integration
def generate_itinerary_pipeline(destination: str, days: int, from_city: str = "various locations",
                              budget: str = "medium", interests: List[str] = None,
                              base_url: str = None, api_key: str = None, model: str = "gpt-oss-120b") -> Dict:
    """
    Convenience function to generate an itinerary using the pipeline.
    
    Args:
        destination: Target destination city
        days: Number of days for the trip
        from_city: Origin city
        budget: Budget level
        interests: List of travel interests
        base_url: Custom LLM base URL
        api_key: API key for the LLM
        model: Model name to use
        
    Returns:
        Complete enriched itinerary
    """
    pipeline = ItineraryPipeline(base_url=base_url, api_key=api_key, model=model)
    return pipeline.generate_itinerary(destination, days, from_city, budget, interests)

def add_custom_knowledge_pipeline(destination: str, topic: str, content: str,
                                base_url: str = None, api_key: str = None, model: str = "gpt-oss-120b") -> bool:
    """Convenience function to add custom knowledge to the pipeline."""
    pipeline = ItineraryPipeline(base_url=base_url, api_key=api_key, model=model)
    return pipeline.add_custom_knowledge(destination, topic, content)

# Example usage and testing
if __name__ == "__main__":
    # Test the complete pipeline
    print("Testing Itinerary Pipeline...")
    
    # Initialize pipeline
    pipeline = ItineraryPipeline()
    
    # Test pipeline status
    status = pipeline.get_pipeline_status()
    print(f"Pipeline status: {status}")
    
    # Test itinerary generation
    itinerary = pipeline.generate_itinerary("London", 3, "New York", "luxury", ["culture", "food"])
    
    print("\nGenerated itinerary:")
    print(f"Summary: {itinerary.get('summary', 'N/A')}")
    print(f"Days: {len(itinerary.get('itinerary', []))}")
    print(f"AI Provider: {itinerary.get('ai_provider', 'N/A')}")
    print(f"Pipeline Info: {itinerary.get('pipeline_info', {})}")
    
    # Test adding custom knowledge
    success = pipeline.add_custom_knowledge("london", "activities", "Visit the new London Bridge Experience")
    print(f"\nCustom knowledge addition: {'SUCCESS' if success else 'FAILED'}")