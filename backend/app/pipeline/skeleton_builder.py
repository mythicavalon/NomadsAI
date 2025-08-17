"""
Stage 1: Skeleton Builder
Generates structured JSON itineraries using GPT-OSS-120B with strict schema enforcement.
"""

import json
import logging
from typing import Dict, List, Optional
from jsonschema import validate, ValidationError
from ..services.llm_client import chat, is_configured

logger = logging.getLogger(__name__)

# Strict JSON schema for itinerary validation
ITINERARY_SCHEMA = {
    "type": "object",
    "properties": {
        "summary": {"type": "string", "minLength": 10},
        "destination": {"type": "string", "minLength": 2},
        "total_days": {"type": "integer", "minimum": 1},
        "itinerary": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "day": {"type": "integer", "minimum": 1},
                    "theme": {"type": "string", "minLength": 5},
                    "activities": {
                        "type": "array",
                        "items": {"type": "string", "minLength": 10},
                        "minItems": 3,
                        "maxItems": 5
                    },
                    "highlights": {
                        "type": "array", 
                        "items": {"type": "string", "minLength": 5},
                        "minItems": 2,
                        "maxItems": 4
                    },
                    "cultural_insight": {"type": "string", "minLength": 20},
                    "local_secrets": {"type": "string", "minLength": 20},
                    "travel_tips": {"type": "string", "minLength": 20}
                },
                "required": ["day", "theme", "activities", "highlights", "cultural_insight", "local_secrets", "travel_tips"]
            }
        }
    },
    "required": ["summary", "destination", "total_days", "itinerary"]
}

def build_skeleton(destination: str, days: int, from_city: str = "various locations", 
                  budget: str = "medium", interests: List[str] = None,
                  base_url: str = None, api_key: str = None, model: str = "nvidia/gpt-oss-120b") -> Dict:
    """
    Stage 1: Generate structured itinerary skeleton using GPT-OSS-120B.
    
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
        Validated JSON skeleton following strict schema
        
    Raises:
        Exception: If unable to generate valid skeleton after retries
    """
    if not is_configured() and not (base_url and api_key):
        logger.warning("LLM not configured, using fallback skeleton")
        return _generate_fallback_skeleton(destination, days, from_city, budget, interests)
    
    interests = interests or ["culture", "food"]
    max_retries = 3
    
    # Enhanced prompt for GPT-OSS-120B with strict JSON requirements
    system_prompt = f"""You are an expert travel planner specializing in {destination}. 

CRITICAL REQUIREMENTS:
1. Output ONLY valid JSON - no markdown, no prose, no explanations
2. Every field must contain {destination}-specific content
3. Activities must be real, specific attractions/experiences in {destination}
4. No generic content like "Morning Exploration" - use actual place names
5. If unsure about specific details, use "TBD" instead of leaving blank

JSON Schema Requirements:
- summary: Brief overview of the {days}-day journey
- destination: "{destination}"
- total_days: {days}
- itinerary: Array of {days} day objects

Each day must have:
- day: Day number (1, 2, 3...)
- theme: Specific theme for that day in {destination}
- activities: 3-5 specific activities with real {destination} locations
- highlights: 2-4 must-see attractions in {destination}
- cultural_insight: Cultural information specific to {destination}
- local_secrets: Hidden gems and insider tips for {destination}
- travel_tips: Practical advice specific to {destination}

Budget level: {budget}
Interests: {', '.join(interests)}
Origin: {from_city}"""

    user_prompt = f"""Generate a {days}-day itinerary for {destination} as JSON only. 

Requirements:
- Budget: {budget}
- Interests: {', '.join(interests)}
- Traveling from: {from_city}
- Output format: Pure JSON following the exact schema
- All content must be {destination}-specific
- Use real attraction names, not generic descriptions"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    for attempt in range(max_retries):
        try:
            logger.info(f"Generating skeleton for {destination} (attempt {attempt + 1})")
            
            # Call GPT-OSS-120B
            response = chat(messages, base_url=base_url, api_key=api_key, model=model)
            
            # Clean response - extract JSON from potential markdown
            json_str = _extract_json_from_response(response)
            
            # Parse JSON
            skeleton = json.loads(json_str)
            
            # Validate against schema
            validate(instance=skeleton, schema=ITINERARY_SCHEMA)
            
            # Additional validation - ensure no empty required fields
            _validate_content_quality(skeleton, destination)
            
            logger.info(f"Successfully generated validated skeleton for {destination}")
            return skeleton
            
        except json.JSONDecodeError as e:
            logger.warning(f"Invalid JSON in attempt {attempt + 1}: {e}")
            if attempt == max_retries - 1:
                logger.error("Failed to generate valid JSON after all retries")
                
        except ValidationError as e:
            logger.warning(f"Schema validation failed in attempt {attempt + 1}: {e}")
            if attempt == max_retries - 1:
                logger.error("Failed to generate valid schema after all retries")
                
        except Exception as e:
            logger.warning(f"Skeleton generation failed in attempt {attempt + 1}: {e}")
            if attempt == max_retries - 1:
                logger.error("Failed to generate skeleton after all retries")
    
    # Final fallback
    logger.warning("Using fallback skeleton after all AI attempts failed")
    return _generate_fallback_skeleton(destination, days, from_city, budget, interests)

def _extract_json_from_response(response: str) -> str:
    """Extract JSON from AI response that might contain markdown or extra text."""
    # Remove markdown code blocks
    if "```json" in response:
        start = response.find("```json") + 7
        end = response.find("```", start)
        if end != -1:
            response = response[start:end]
    elif "```" in response:
        start = response.find("```") + 3
        end = response.find("```", start)
        if end != -1:
            response = response[start:end]
    
    # Find JSON object boundaries
    start_brace = response.find("{")
    end_brace = response.rfind("}") + 1
    
    if start_brace != -1 and end_brace > start_brace:
        return response[start_brace:end_brace].strip()
    
    return response.strip()

def _validate_content_quality(skeleton: Dict, destination: str) -> None:
    """Validate that content is destination-specific and not generic."""
    destination_lower = destination.lower()
    
    for day_data in skeleton.get("itinerary", []):
        # Check that activities mention the destination or are specific
        activities = day_data.get("activities", [])
        for activity in activities:
            if activity == "TBD":
                continue
            # Activities should be specific, not generic
            generic_terms = ["morning exploration", "city walk", "local experience"]
            if any(term in activity.lower() for term in generic_terms):
                raise ValidationError(f"Activity too generic: {activity}")
        
        # Check required fields are not just "TBD"
        required_fields = ["cultural_insight", "local_secrets", "travel_tips"]
        for field in required_fields:
            value = day_data.get(field, "")
            if not value or value == "TBD":
                raise ValidationError(f"Required field '{field}' is empty or TBD")

def _generate_fallback_skeleton(destination: str, days: int, from_city: str, 
                               budget: str, interests: List[str]) -> Dict:
    """Generate a basic fallback skeleton when AI fails."""
    interests = interests or ["culture", "food"]
    
    itinerary = []
    for i in range(days):
        day_num = i + 1
        itinerary.append({
            "day": day_num,
            "theme": f"Day {day_num}: Explore {destination}",
            "activities": [
                f"Visit {destination} main attractions and landmarks",
                f"Experience {destination} local culture and cuisine", 
                f"Discover {destination} hidden gems and markets"
            ],
            "highlights": [f"{destination} landmarks", f"{destination} culture"],
            "cultural_insight": f"Immerse yourself in {destination}'s rich cultural heritage and local traditions.",
            "local_secrets": f"Explore authentic local experiences and hidden gems throughout {destination}.",
            "travel_tips": f"Navigate {destination} efficiently with local transport and insider knowledge."
        })
    
    return {
        "summary": f"Your {days}-day journey exploring {destination} from {from_city}",
        "destination": destination,
        "total_days": days,
        "itinerary": itinerary
    }

def validate_skeleton(skeleton: Dict) -> bool:
    """Validate skeleton against schema."""
    try:
        validate(instance=skeleton, schema=ITINERARY_SCHEMA)
        return True
    except ValidationError:
        return False

# Export for pipeline integration
__all__ = ["build_skeleton", "validate_skeleton", "ITINERARY_SCHEMA"]