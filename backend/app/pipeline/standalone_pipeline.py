"""
Standalone Lightweight Pipeline
Minimal fallback template generator when all AI providers fail.
No pre-loaded knowledge - purely template-based for extreme fallback only.
"""

import json
import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class StandalonePipeline:
    """Minimal fallback pipeline for when all AI providers fail. No pre-loaded data."""
    
    def __init__(self):
        """Initialize the standalone pipeline."""
        logger.info("Standalone Pipeline initialized (Fallback mode - no pre-loaded data)")
    
    def generate_itinerary(self, destination: str, days: int, from_city: str = "various locations",
                          budget: str = "medium", interests: List[str] = None) -> Dict:
        """
        Generate a basic template itinerary (fallback only - all AI providers failed).
        
        Args:
            destination: Target destination city
            days: Number of days for the trip
            from_city: Origin city
            budget: Budget level
            interests: List of travel interests
            
        Returns:
            Basic template itinerary dictionary
        """
        logger.warning(f"Using fallback template for {destination} - all AI providers failed!")
        return self._generate_fallback_itinerary(destination, days, from_city, budget, interests)
    
    def _generate_fallback_itinerary(self, destination: str, days: int, from_city: str, 
                                   budget: str, interests: List[str]) -> Dict:
        """Generate a basic template itinerary when all AI providers fail."""
        interests = interests or ["culture", "food", "sightseeing"]
        
        # Create interest-based activity suggestions
        interest_templates = {
            "culture": f"Visit {destination}'s museums, galleries, and cultural landmarks",
            "food": f"Explore local restaurants, markets, and culinary experiences in {destination}",
            "history": f"Discover historical sites and heritage locations in {destination}",
            "adventure": f"Experience outdoor activities and adventures around {destination}",
            "art": f"Explore art galleries and creative spaces in {destination}",
            "nature": f"Visit parks, gardens, and natural attractions near {destination}",
            "shopping": f"Browse local markets, boutiques, and shopping districts in {destination}",
            "nightlife": f"Experience {destination}'s evening entertainment and nightlife",
            "business": f"Professional networking and business venues in {destination}",
            "leisure": f"Relaxation and leisure activities in {destination}"
        }
        
        itinerary = []
        for i in range(days):
            day_num = i + 1
            
            # Create activities based on interests
            activities = []
            for idx, interest in enumerate(interests[:3]):  # Max 3 interests
                if interest in interest_templates:
                    time_prefix = ["Morning", "Afternoon", "Evening"][idx]
                    activities.append(f"{time_prefix}: {interest_templates[interest]}")
            
            # Fill remaining slots
            while len(activities) < 3:
                activities.extend([
                    f"Morning: Explore {destination}'s main attractions and landmarks",
                    f"Afternoon: Experience local culture and traditions",
                    f"Evening: Enjoy {destination} cuisine and dining"
                ])
            
            itinerary.append({
                "day": day_num,
                "theme": f"Day {day_num}: Exploring {destination}",
                "activities": activities[:3],
                "highlights": [f"Discover {destination}", f"Experience {', '.join(interests[:2])}"],
                "cultural_insight": f"Immerse yourself in {destination}'s unique culture and traditions.",
                "local_secrets": f"Discover hidden gems and authentic experiences in {destination}.",
                "travel_tips": f"Research {destination} travel guides for detailed recommendations and local insights."
            })
        
        return {
            "summary": f"Your {days}-day journey from {from_city} to {destination} (Basic Template - Configure AI providers for detailed itineraries)",
            "itinerary": itinerary,
            "estimated_budget": budget,
            "ai_provider": "Fallback Template Generator (AI providers not configured)",
            "from_city": from_city,
            "destination": destination,
            "total_days": days,
            "pipeline_info": {
                "stages_completed": ["basic_template_generation"],
                "skeleton_validation": False,
                "enrichment_success": False,
                "pipeline_type": "fallback_template",
                "note": "Configure GROQ_API_KEY or DEEPSEEK_API_KEY for AI-powered itineraries"
            }
        }

# Convenience function for easy integration (legacy compatibility)
def generate_itinerary_pipeline(destination: str, days: int, from_city: str = "various locations",
                               budget: str = "medium", interests: List[str] = None,
                               base_url: str = None, api_key: str = None, model: str = None) -> Dict:
    """
    Convenience function to generate a fallback template itinerary.
    
    NOTE: This is a minimal fallback only. For AI-powered itineraries, use the AI services
    in services/ai_itinerary.py with Groq or DeepSeek API keys configured.
    
    Args:
        destination: Target destination city
        days: Number of days for the trip
        from_city: Origin city
        budget: Budget level
        interests: List of travel interests
        base_url: Not used (legacy parameter)
        api_key: Not used (legacy parameter)
        model: Not used (legacy parameter)
        
    Returns:
        Basic template itinerary (for fallback only)
    """
    pipeline = StandalonePipeline()
    return pipeline.generate_itinerary(destination, days, from_city, budget, interests)

if __name__ == "__main__":
    # Test the fallback pipeline
    print("Testing Fallback Template Pipeline...")
    print("NOTE: This is a basic fallback. Configure AI providers for full features.\n")
    
    pipeline = StandalonePipeline()
    
    # Test itinerary generation
    itinerary = pipeline.generate_itinerary("Paris", 3, "New York", "luxury", ["culture", "food"])
    
    print("\nGenerated Fallback Template:")
    print(json.dumps(itinerary, indent=2))
    
    print("\n✅ Fallback template test completed!")
    print("💡 Configure GROQ_API_KEY or DEEPSEEK_API_KEY for AI-powered itineraries")