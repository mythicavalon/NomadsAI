"""
AI-Powered Dynamic Itinerary Generation Service
Generates personalized travel itineraries using AI without pre-fed data.
"""

import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

from .llm_provider import generate_completion

logger = logging.getLogger(__name__)

SYSTEM_INSTRUCTION = """You are NomadAI, a helpful travel planner that creates personalized, dynamic itineraries.

Your role is to generate detailed, day-by-day travel itineraries based on user requests. You should:

1. Create practical, realistic itineraries that can actually be followed
2. Include specific attractions, restaurants, and activities
3. Consider travel time between locations
4. Provide cultural insights and local tips
5. Suggest hidden gems and authentic experiences
6. Adapt to the user's budget, interests, and travel style

Always respond with a valid JSON structure containing the complete itinerary."""

async def generate_dynamic_itinerary(
    destination: str,
    days: int,
    from_city: str = "various locations",
    budget: str = "medium",
    interests: List[str] = None,
    travelers: int = 1,
    departure_date: str = None,
    return_date: str = None
) -> Dict[str, Any]:
    """
    Generate a dynamic itinerary using AI without any pre-fed data.
    
    Args:
        destination: Target destination city/country
        days: Number of days for the trip
        from_city: Origin city
        budget: Budget level (budget, medium, premium, luxury)
        interests: List of traveler interests
        travelers: Number of travelers
        departure_date: Departure date (YYYY-MM-DD)
        return_date: Return date (YYYY-MM-DD)
        
    Returns:
        Complete itinerary with AI-generated content
    """
    interests = interests or ["culture", "food", "sightseeing"]
    
    # Create the user prompt
    user_prompt = f"""Plan a {days}-day trip to {destination} for {travelers} traveler(s) with a {budget} budget.

Traveler details:
- Departing from: {from_city}
- Travel dates: {departure_date} to {return_date}
- Interests: {', '.join(interests)}
- Budget level: {budget}

Please create a detailed itinerary with the following JSON structure:
{{
    "summary": "Brief description of the trip",
    "itinerary": [
        {{
            "day": 1,
            "theme": "Day theme/title",
            "activities": [
                "Morning activity with specific location and time",
                "Afternoon activity with specific location and time",
                "Evening activity with specific location and time"
            ],
            "highlights": ["Key highlight 1", "Key highlight 2"],
            "cultural_insight": "Cultural insight about the destination",
            "local_secrets": "Local hidden gems and secrets",
            "travel_tips": "Practical travel tips for this day"
        }}
    ],
    "estimated_budget": "{budget}",
    "cultural_insights": "Overall cultural insights about {destination}",
    "local_recommendations": "Hidden gems and local recommendations",
    "travel_tips": "General travel tips for {destination}",
    "ai_provider": "Dynamic AI Generation"
}}

Make sure to include:
- Specific attraction names, restaurants, and locations
- Realistic timing and logistics
- Cultural context and local insights
- Hidden gems and authentic experiences
- Practical travel advice
- Budget-appropriate suggestions"""

    try:
        messages = [
            {"role": "system", "content": SYSTEM_INSTRUCTION},
            {"role": "user", "content": user_prompt}
        ]
        
        # Generate the itinerary using AI
        response = await generate_completion(messages, temperature=0.8, max_tokens=3000)
        
        # Try to parse the JSON response
        try:
            itinerary_data = json.loads(response)
            
            # Ensure all required fields are present
            if not isinstance(itinerary_data, dict):
                raise ValueError("Response is not a valid dictionary")
            
            # Validate and clean the response
            validated_itinerary = _validate_itinerary_response(
                itinerary_data, destination, days, from_city, budget
            )
            
            logger.info(f"Successfully generated dynamic itinerary for {destination}")
            return validated_itinerary
            
        except (json.JSONDecodeError, ValueError) as e:
            logger.warning(f"Failed to parse AI response as JSON: {e}")
            # Extract itinerary data from text response
            return _extract_itinerary_from_text(response, destination, days, from_city, budget)
    
    except Exception as e:
        logger.error(f"Failed to generate AI itinerary: {e}")
        # Return a basic dynamic itinerary
        return _generate_basic_dynamic_itinerary(destination, days, from_city, budget, interests)

def _validate_itinerary_response(
    data: Dict[str, Any], 
    destination: str, 
    days: int, 
    from_city: str, 
    budget: str
) -> Dict[str, Any]:
    """Validate and clean the AI response"""
    
    # Ensure required top-level fields
    validated = {
        "summary": data.get("summary", f"Your {days}-day journey to {destination}"),
        "itinerary": [],
        "estimated_budget": data.get("estimated_budget", budget),
        "cultural_insights": data.get("cultural_insights", f"Discover the rich culture of {destination}"),
        "local_recommendations": data.get("local_recommendations", f"Explore hidden gems in {destination}"),
        "travel_tips": data.get("travel_tips", f"Essential tips for traveling to {destination}"),
        "ai_provider": data.get("ai_provider", "Dynamic AI Generation"),
        "from_city": from_city,
        "destination": destination,
        "total_days": days
    }
    
    # Validate itinerary days
    raw_itinerary = data.get("itinerary", [])
    for i in range(days):
        day_num = i + 1
        
        # Find the day in the response or create a basic one
        day_data = None
        for day in raw_itinerary:
            if isinstance(day, dict) and day.get("day") == day_num:
                day_data = day
                break
        
        if not day_data:
            day_data = {
                "day": day_num,
                "theme": f"Day {day_num} in {destination}",
                "activities": [
                    f"Morning: Explore {destination} attractions",
                    f"Afternoon: Local cultural experiences",
                    f"Evening: Traditional {destination} cuisine"
                ],
                "highlights": [f"Discover {destination}", "Local culture"],
                "cultural_insight": f"Experience the culture of {destination}",
                "local_secrets": f"Hidden gems in {destination}",
                "travel_tips": f"Tips for day {day_num} in {destination}"
            }
        
        # Ensure all day fields are strings (not lists)
        validated_day = {
            "day": day_data.get("day", day_num),
            "theme": str(day_data.get("theme", f"Day {day_num} in {destination}")),
            "activities": day_data.get("activities", []),
            "highlights": day_data.get("highlights", []),
            "cultural_insight": str(day_data.get("cultural_insight", f"Culture of {destination}")),
            "local_secrets": str(day_data.get("local_secrets", f"Local secrets in {destination}")),
            "travel_tips": str(day_data.get("travel_tips", f"Travel tips for {destination}"))
        }
        
        validated["itinerary"].append(validated_day)
    
    return validated

def _extract_itinerary_from_text(
    response: str, 
    destination: str, 
    days: int, 
    from_city: str, 
    budget: str
) -> Dict[str, Any]:
    """Extract itinerary information from text response"""
    
    # Create a basic structure with AI-generated content
    itinerary = []
    
    # Split response into sections and try to extract day information
    lines = response.split('\n')
    current_day = None
    activities = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Look for day indicators
        if any(word in line.lower() for word in ['day 1', 'day 2', 'day 3', 'day 4', 'day 5']):
            # Save previous day if exists
            if current_day and activities:
                itinerary.append({
                    "day": current_day,
                    "theme": f"Day {current_day} in {destination}",
                    "activities": activities[:3],  # Limit to 3 activities
                    "highlights": [f"Explore {destination}", "Cultural experiences"],
                    "cultural_insight": f"Immerse in {destination}'s culture",
                    "local_secrets": f"Discover hidden gems in {destination}",
                    "travel_tips": f"Navigate {destination} like a local"
                })
            
            # Start new day
            for i in range(1, days + 1):
                if f'day {i}' in line.lower():
                    current_day = i
                    activities = []
                    break
        
        # Collect activities
        elif current_day and line and not line.startswith('#'):
            if len(activities) < 3:
                activities.append(line)
    
    # Add the last day
    if current_day and activities:
        itinerary.append({
            "day": current_day,
            "theme": f"Day {current_day} in {destination}",
            "activities": activities[:3],
            "highlights": [f"Explore {destination}", "Cultural experiences"],
            "cultural_insight": f"Immerse in {destination}'s culture",
            "local_secrets": f"Discover hidden gems in {destination}",
            "travel_tips": f"Navigate {destination} like a local"
        })
    
    # Fill in missing days
    while len(itinerary) < days:
        day_num = len(itinerary) + 1
        itinerary.append({
            "day": day_num,
            "theme": f"Day {day_num} in {destination}",
            "activities": [
                f"Morning: Explore {destination} attractions",
                f"Afternoon: Cultural experiences",
                f"Evening: Local dining"
            ],
            "highlights": [f"Discover {destination}", "Local culture"],
            "cultural_insight": f"Experience {destination}'s unique culture",
            "local_secrets": f"Find hidden spots in {destination}",
            "travel_tips": f"Essential tips for {destination}"
        })
    
    return {
        "summary": f"Your {days}-day AI-generated journey to {destination}",
        "itinerary": itinerary,
        "estimated_budget": budget,
        "cultural_insights": f"Discover the rich cultural heritage of {destination}",
        "local_recommendations": f"Explore authentic experiences in {destination}",
        "travel_tips": f"Essential travel advice for visiting {destination}",
        "ai_provider": "Dynamic AI Generation",
        "from_city": from_city,
        "destination": destination,
        "total_days": days
    }

def _generate_basic_dynamic_itinerary(
    destination: str, 
    days: int, 
    from_city: str, 
    budget: str, 
    interests: List[str]
) -> Dict[str, Any]:
    """Generate a basic dynamic itinerary when AI fails"""
    
    # Create interest-based activities
    interest_activities = {
        "culture": f"Visit {destination}'s museums and cultural sites",
        "food": f"Explore {destination}'s culinary scene",
        "history": f"Discover {destination}'s historical landmarks",
        "adventure": f"Outdoor activities and adventures in {destination}",
        "art": f"Art galleries and creative spaces in {destination}",
        "nature": f"Parks and natural attractions in {destination}",
        "shopping": f"Local markets and shopping districts in {destination}",
        "nightlife": f"Experience {destination}'s evening entertainment"
    }
    
    itinerary = []
    for i in range(days):
        day_num = i + 1
        
        # Select activities based on interests
        day_activities = []
        for interest in interests[:3]:  # Max 3 interests per day
            if interest in interest_activities:
                day_activities.append(interest_activities[interest])
        
        # Fill with generic activities if needed
        while len(day_activities) < 3:
            day_activities.extend([
                f"Morning exploration of {destination}",
                f"Afternoon cultural activities in {destination}",
                f"Evening dining and relaxation in {destination}"
            ])
        
        itinerary.append({
            "day": day_num,
            "theme": f"Day {day_num}: Exploring {destination}",
            "activities": day_activities[:3],
            "highlights": [f"Discover {destination}", "Cultural immersion"],
            "cultural_insight": f"Experience the authentic culture of {destination}",
            "local_secrets": f"Uncover hidden gems throughout {destination}",
            "travel_tips": f"Navigate {destination} with confidence and local knowledge"
        })
    
    return {
        "summary": f"Your personalized {days}-day journey to {destination}",
        "itinerary": itinerary,
        "estimated_budget": budget,
        "cultural_insights": f"Immerse yourself in the rich culture and traditions of {destination}",
        "local_recommendations": f"Discover authentic local experiences and hidden gems in {destination}",
        "travel_tips": f"Essential travel advice for making the most of your {destination} adventure",
        "ai_provider": "Dynamic Fallback Generation",
        "from_city": from_city,
        "destination": destination,
        "total_days": days
    }