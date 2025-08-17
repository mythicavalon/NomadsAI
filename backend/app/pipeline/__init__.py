"""
Two-Stage Itinerary Generation Pipeline

Stage 1: Skeleton Builder - Uses GPT-OSS-120B to generate structured JSON itineraries
Stage 2: Knowledge Grounding - Enriches skeleton with factual data from multiple sources

This pipeline combines AI creativity with factual knowledge grounding for optimal results.
"""

# Import the new two-stage pipeline
from .data_retriever import create_two_stage_pipeline, enrich_skeleton, DataRetriever
from .skeleton_builder import build_skeleton, validate_skeleton

# Import standalone pipeline for fallback compatibility
from .standalone_pipeline import generate_itinerary_pipeline

# Main pipeline function - uses two-stage AI-enhanced pipeline by default
def generate_itinerary_pipeline_enhanced(destination: str, days: int, from_city: str = "various locations",
                                        budget: str = "medium", interests: list = None,
                                        base_url: str = None, api_key: str = None, 
                                        model: str = "nvidia/gpt-oss-120b") -> dict:
    """
    Enhanced two-stage pipeline combining GPT-OSS-120B AI with factual knowledge grounding.
    
    This is the recommended pipeline for production use as it provides:
    - AI-generated creative itineraries (Stage 1)
    - Factual knowledge enrichment (Stage 2)
    - Real attraction names and cultural insights
    - Fallback safety for reliability
    
    Args:
        destination: Target destination city
        days: Number of days for the trip
        from_city: Origin city
        budget: Budget level (budget, medium, premium, luxury)
        interests: List of traveler interests
        base_url: Optional custom API base URL
        api_key: Optional custom API key
        model: AI model to use
        
    Returns:
        Complete enriched itinerary with AI creativity and factual grounding
    """
    try:
        # Use the two-stage AI-enhanced pipeline
        return create_two_stage_pipeline(destination, days, from_city, budget, interests, 
                                       base_url, api_key, model)
    except Exception as e:
        # Fallback to standalone pipeline for reliability
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"Two-stage pipeline failed, using standalone fallback: {e}")
        return generate_itinerary_pipeline(destination, days, from_city, budget, interests)

__all__ = [
    # Main enhanced pipeline (recommended)
    'generate_itinerary_pipeline_enhanced',
    
    # Two-stage components
    'create_two_stage_pipeline',
    'build_skeleton', 
    'enrich_skeleton',
    'validate_skeleton',
    'DataRetriever',
    
    # Standalone pipeline (fallback)
    'generate_itinerary_pipeline'
]