"""
Stage 1: Skeleton Builder
Generates structured JSON itineraries using GPT-OSS with strict schema validation.
"""

import json
import logging
from typing import Dict, List, Optional
from jsonschema import validate, ValidationError
from ..services.gpt_oss import llm_chat

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Strict JSON schema for itineraries
ITINERARY_SCHEMA = {
    "type": "object",
    "properties": {
        "summary": {"type": "string", "minLength": 10},
        "itinerary": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "day": {"type": "integer", "minimum": 1},
                    "theme": {"type": "string", "minLength": 5},
                    "activities": {
                        "type": "array",
                        "items": {"type": "string", "minLength": 5},
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
        },
        "estimated_budget": {"type": "string", "minLength": 5},
        "ai_provider": {"type": "string"}
    },
    "required": ["summary", "itinerary", "estimated_budget", "ai_provider"]
}

def build_skeleton(destination: str, days: int, from_city: str = "various locations", 
                  budget: str = "medium", interests: List[str] = None, 
                  base_url: str = None, api_key: str = None, model: str = "gpt-oss-120b") -> Dict:
    """
    Build a structured itinerary skeleton using GPT-OSS.
    
    Args:
        destination: Target destination city
        days: Number of days for the trip
        from_city: Origin city
        budget: Budget level (budget, medium, luxury)
        interests: List of travel interests
        base_url: Custom LLM base URL (None for default GPT-OSS)
        api_key: API key for the LLM
        model: Model name to use
        
    Returns:
        Dict containing the validated itinerary skeleton
    """
    
    if interests is None:
        interests = ["culture", "food", "exploration"]
    
    logger.info(f"Building skeleton for {destination} ({days} days) from {from_city}")
    
    # Stage 1: Generate skeleton with strict instructions
    skeleton_prompt = [
        {
            "role": "system",
            "content": f"""You are a travel itinerary skeleton builder. Your ONLY job is to output valid JSON following the exact schema provided.

CRITICAL RULES:
1. Output ONLY valid JSON - no prose, no markdown, no formatting errors
2. Follow the schema EXACTLY - no extra fields, no missing fields
3. All string fields must have meaningful content (minimum length requirements)
4. If unsure about any field, use "TBD" instead of leaving blank
5. Activities must be specific to {destination}, not generic
6. Each day must have exactly 3-5 activities and 2-4 highlights

DESTINATION: {destination}
DAYS: {days}
FROM: {from_city}
BUDGET: {budget}
INTERESTS: {', '.join(interests)}

SCHEMA TO FOLLOW:
{json.dumps(ITINERARY_SCHEMA, indent=2)}

REMEMBER: Output ONLY the JSON object, nothing else."""
        },
        {
            "role": "user",
            "content": f"Generate a {days}-day itinerary skeleton for {destination} following the exact schema. Ensure all fields are populated with destination-specific content."
        }
    ]
    
    max_retries = 3
    for attempt in range(max_retries):
        try:
            logger.info(f"Attempt {attempt + 1} to generate skeleton")
            
            # Generate skeleton using LLM
            response = llm_chat(skeleton_prompt, base_url=base_url, api_key=api_key, model=model)
            
            # Extract JSON from response
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            
            if json_start == -1 or json_end == 0:
                logger.warning(f"Attempt {attempt + 1}: No JSON found in response")
                continue
                
            json_str = response[json_start:json_end]
            
            # Parse JSON
            skeleton = json.loads(json_str)
            
            # Validate against schema
            validate(instance=skeleton, schema=ITINERARY_SCHEMA)
            
            logger.info(f"Skeleton generated successfully on attempt {attempt + 1}")
            return skeleton
            
        except json.JSONDecodeError as e:
            logger.warning(f"Attempt {attempt + 1}: JSON decode error: {e}")
            continue
        except ValidationError as e:
            logger.warning(f"Attempt {attempt + 1}: Schema validation error: {e}")
            continue
        except Exception as e:
            logger.warning(f"Attempt {attempt + 1}: Unexpected error: {e}")
            continue
    
    # If all retries failed, generate a fallback skeleton
    logger.warning("All retries failed, generating fallback skeleton")
    return _generate_fallback_skeleton(destination, days, from_city, budget, interests)

def _generate_fallback_skeleton(destination: str, days: int, from_city: str, budget: str, interests: List[str]) -> Dict:
    """Generate a fallback skeleton when LLM generation fails."""
    
    itinerary = []
    for day in range(1, days + 1):
        day_data = {
            "day": day,
            "theme": f"Day {day}: {destination} exploration and cultural immersion",
            "activities": [
                f"Explore {destination} city center",
                f"Visit {destination} cultural sites",
                f"Experience {destination} local cuisine"
            ],
            "highlights": [
                f"Discover {destination} hidden gems",
                f"Immerse in {destination} local culture"
            ],
            "cultural_insight": f"Learn about {destination}'s rich cultural heritage and local customs. Respect local traditions and engage with the community.",
            "local_secrets": f"Explore authentic experiences beyond typical tourist spots in {destination}. Ask locals for recommendations and discover hidden gems.",
            "travel_tips": f"Plan your trip from {from_city} to {destination} with local insights. Consider best times to visit and local transportation options."
        }
        itinerary.append(day_data)
    
    return {
        "summary": f"Your {days}-day journey from {from_city} to {destination}",
        "itinerary": itinerary,
        "estimated_budget": budget,
        "ai_provider": "Fallback Generator"
    }

def validate_skeleton(skeleton: Dict) -> bool:
    """Validate a skeleton against the schema."""
    try:
        validate(instance=skeleton, schema=ITINERARY_SCHEMA)
        return True
    except ValidationError as e:
        logger.error(f"Skeleton validation failed: {e}")
        return False

# Example usage and testing
if __name__ == "__main__":
    # Test the skeleton builder
    test_skeleton = build_skeleton("London", 3, "New York", "luxury", ["culture", "food"])
    print("Generated skeleton:")
    print(json.dumps(test_skeleton, indent=2))
    
    # Validate the skeleton
    is_valid = validate_skeleton(test_skeleton)
    print(f"\nSkeleton validation: {'PASSED' if is_valid else 'FAILED'}")