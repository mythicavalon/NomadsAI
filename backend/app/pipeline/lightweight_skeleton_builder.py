"""
Lightweight Skeleton Builder
Simplified version without heavy dependencies for quick deployment.
"""

import json
import logging
from typing import Dict, List, Optional
from ..services.gpt_oss import llm_chat

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def validate_skeleton(skeleton: Dict) -> bool:
    """
    Lightweight validation without jsonschema dependency.
    
    Args:
        skeleton: The skeleton to validate
        
    Returns:
        True if valid, False otherwise
    """
    try:
        # Basic structure validation
        if not isinstance(skeleton, dict):
            return False
        
        required_keys = ["summary", "itinerary", "estimated_budget"]
        for key in required_keys:
            if key not in skeleton:
                return False
        
        # Check itinerary structure
        itinerary = skeleton.get("itinerary", [])
        if not isinstance(itinerary, list) or len(itinerary) == 0:
            return False
        
        for day in itinerary:
            if not isinstance(day, dict):
                return False
            
            day_required = ["day", "theme", "activities", "highlights", "cultural_insight", "local_secrets", "travel_tips"]
            for key in day_required:
                if key not in day:
                    return False
            
            # Check activities
            activities = day.get("activities", [])
            if not isinstance(activities, list) or len(activities) < 2:
                return False
            
            # Check highlights
            highlights = day.get("highlights", [])
            if not isinstance(highlights, list) or len(highlights) < 1:
                return False
        
        return True
        
    except Exception as e:
        logger.error(f"Validation error: {e}")
        return False

def build_skeleton(destination: str, days: int, from_city: str = "various locations", 
                   budget: str = "medium", interests: List[str] = None, 
                   base_url: str = None, api_key: str = None, model: str = "gpt-oss-120b") -> Dict:
    """
    Build a skeleton itinerary using the lightweight approach.
    
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
        Skeleton itinerary dictionary
    """
    try:
        logger.info(f"Building skeleton for {destination} ({days} days)")
        
        # Create a simple, structured skeleton without heavy AI calls
        skeleton = _generate_fallback_skeleton(destination, days, from_city, budget, interests)
        
        # Try to enhance with AI if available
        try:
            enhanced = _try_ai_enhancement(destination, days, from_city, budget, interests, base_url, api_key, model)
            if enhanced and validate_skeleton(enhanced):
                logger.info("AI enhancement successful")
                return enhanced
            else:
                logger.info("AI enhancement failed, using fallback")
                return skeleton
        except Exception as e:
            logger.warning(f"AI enhancement failed: {e}, using fallback")
            return skeleton
            
    except Exception as e:
        logger.error(f"Skeleton building failed: {e}")
        return _generate_fallback_skeleton(destination, days, from_city, budget, interests)

def _try_ai_enhancement(destination: str, days: int, from_city: str, budget: str, 
                       interests: List[str], base_url: str, api_key: str, model: str) -> Optional[Dict]:
    """Try to enhance the skeleton with AI."""
    try:
        # Simple prompt for AI enhancement
        prompt = [
            {
                "role": "system",
                "content": f"You are a travel expert for {destination}. Generate a structured JSON itinerary with {days} days."
            },
            {
                "role": "user", 
                "content": f"Create a {days}-day itinerary for {destination} from {from_city}. Budget: {budget}. Interests: {', '.join(interests or [])}. Return only valid JSON with this structure: {{'summary': '...', 'itinerary': [{{'day': 1, 'theme': '...', 'activities': ['...', '...', '...'], 'highlights': ['...', '...'], 'cultural_insight': '...', 'local_secrets': '...', 'travel_tips': '...'}}], 'estimated_budget': '...'}}"
            }
        ]
        
        # Try AI call
        response = llm_chat(prompt, base_url=base_url, api_key=api_key, model=model)
        
        if response and isinstance(response, str):
            # Try to extract JSON
            try:
                # Find JSON in response
                start = response.find('{')
                end = response.rfind('}') + 1
                if start != -1 and end != -1:
                    json_str = response[start:end]
                    parsed = json.loads(json_str)
                    
                    if validate_skeleton(parsed):
                        return parsed
            except json.JSONDecodeError:
                pass
        
        return None
        
    except Exception as e:
        logger.warning(f"AI enhancement failed: {e}")
        return None

def _generate_fallback_skeleton(destination: str, days: int, from_city: str, 
                               budget: str, interests: List[str]) -> Dict:
    """Generate a deterministic fallback skeleton."""
    
    # Create destination-specific themes
    themes = [
        f"Day 1: {destination} introduction and cultural immersion",
        f"Day 2: {destination} main attractions and landmarks",
        f"Day 3: {destination} local experiences and hidden gems",
        f"Day 4: {destination} culinary adventures and nightlife",
        f"Day 5: {destination} shopping and relaxation"
    ]
    
    # Create destination-specific activities
    activities = [
        f"Explore {destination} city center and main attractions",
        f"Visit {destination} museums and cultural sites",
        f"Experience {destination} local cuisine and restaurants",
        f"Discover {destination} hidden gems and local markets",
        f"Enjoy {destination} parks and outdoor spaces"
    ]
    
    # Create destination-specific highlights
    highlights = [
        f"Discover {destination} main landmarks",
        f"Experience {destination} local culture",
        f"Explore {destination} hidden gems",
        f"Taste {destination} authentic cuisine"
    ]
    
    # Create destination-specific insights
    cultural_insight = f"Immerse yourself in {destination}'s rich cultural heritage and local customs. Learn about the city's history, traditions, and modern lifestyle."
    local_secrets = f"Explore authentic experiences beyond typical tourist spots in {destination}. Discover hidden gems, local markets, and neighborhood favorites that showcase the real {destination}."
    travel_tips = f"Plan your trip from {from_city} to {destination} with local insights. Consider best times to visit, local transportation, cultural etiquette, and seasonal considerations."
    
    # Build itinerary
    itinerary = []
    for i in range(days):
        day_num = i + 1
        theme = themes[i % len(themes)]
        day_activities = activities[i % len(activities):(i % len(activities)) + 3]
        if len(day_activities) < 3:
            day_activities.extend(activities[:3 - len(day_activities)])
        
        day_highlights = highlights[i % len(highlights):(i % len(highlights)) + 2]
        if len(day_highlights) < 2:
            day_highlights.extend(highlights[:2 - len(day_highlights)])
        
        itinerary.append({
            "day": day_num,
            "theme": theme,
            "activities": day_activities,
            "highlights": day_highlights,
            "cultural_insight": cultural_insight,
            "local_secrets": local_secrets,
            "travel_tips": travel_tips
        })
    
    return {
        "summary": f"Your {days}-day journey from {from_city} to {destination}",
        "itinerary": itinerary,
        "estimated_budget": budget,
        "ai_provider": "Lightweight Fallback Generator"
    }

if __name__ == "__main__":
    # Test the lightweight skeleton builder
    skeleton = build_skeleton("London", 3, "New York", "luxury", ["culture", "food"])
    print("Generated skeleton:")
    print(json.dumps(skeleton, indent=2))
    
    # Test validation
    is_valid = validate_skeleton(skeleton)
    print(f"\nValidation result: {is_valid}")