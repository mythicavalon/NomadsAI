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

SYSTEM_INSTRUCTION = """You are NomadAI, an expert travel planner with deep knowledge of destinations worldwide.

CRITICAL REQUIREMENTS - You MUST:
1. Include SPECIFIC venue names (e.g., "The Louvre Museum" NOT "visit a museum")
2. Provide REAL restaurant names and cuisine types (e.g., "L'Ambroisie - 3 Michelin star French")
3. List ACTUAL attractions with brief descriptions (e.g., "Eiffel Tower - iconic 324m iron lattice tower")
4. Include SPECIFIC neighborhoods and districts (e.g., "Le Marais district")
5. Mention REAL street names, markets, or landmarks
6. Add timing details (e.g., "9:00 AM", "2-3 hours duration")
7. Include practical details (transport, tickets, booking tips)
8. Suggest lesser-known LOCAL spots, not just tourist traps
9. Provide AUTHENTIC cultural insights specific to the destination
10. Use your knowledge - give REAL, VERIFIABLE information

BAD Example: "Visit main attractions, explore the city, try local food"
GOOD Example: "Sagrada Familia - Gaudí's unfinished basilica (€26, book ahead), Park Güell - whimsical gardens with city views, La Boqueria Market - vibrant food market on Las Ramblas"

Always respond with valid JSON. Be SPECIFIC and DETAILED."""

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
    
    # Budget-specific guidance
    budget_guidance = {
        "budget": "hostels, street food, free attractions, public transport, local eateries under $15/meal",
        "essential": "3-star hotels, casual dining $15-30/meal, mix of paid/free attractions, metro/bus",
        "medium": "4-star hotels, mid-range restaurants $30-60/meal, popular attractions, occasional taxi",
        "premium": "4-5 star hotels, fine dining $60-150/meal, skip-the-line tickets, private transfers when needed",
        "luxury": "5-star hotels/suites, Michelin-starred dining $150+/meal, VIP experiences, private car service, exclusive access"
    }
    
    budget_details = budget_guidance.get(budget, budget_guidance["medium"])
    
    # Create DETAILED, SPECIFIC prompt
    user_prompt = f"""You are a luxury travel concierge planning a {days}-day trip to {destination} for {travelers} traveler(s).

CLIENT PROFILE:
- Budget Level: {budget.upper()} ({budget_details})
- Interests: {', '.join(interests)}
- Travel Dates: {departure_date} to {return_date}
- Origin: {from_city}

YOUR TASK - Create an EXCEPTIONAL itinerary with:

✓ SPECIFIC VENUES: Real names, addresses, signature items/exhibits
✓ RESTAURANTS: Actual establishments with cuisine type, price range, must-try dishes, reservation needs
✓ TIMING: Exact times (e.g., "9:30 AM"), duration estimates, queue times
✓ TRANSPORT: How to get between venues (walk 10min, taxi €15, metro line 4)
✓ INSIDER TIPS: Booking advice, best times to visit, dress codes, local etiquette
✓ HIDDEN GEMS: Lesser-known spots locals love, not just TripAdvisor top 10
✓ CULTURAL CONTEXT: Historical significance, local customs, interesting facts
✓ PRACTICAL DETAILS: Ticket prices, opening hours, what to bring

BUDGET REQUIREMENTS for {budget}:
{budget_details}

DO NOT USE:
❌ Generic phrases like "explore the city" or "visit main attractions"
❌ Vague descriptions like "a famous museum" or "local restaurant"
❌ Placeholder content like "experience local culture"

GOOD EXAMPLE FORMAT (adapt to your destination):
✓ "10:00 AM - [Museum Name] ([Address]) - [What's special]. [Price], [timing], [insider tip]. Allow [duration]."
✓ "1:00 PM - [Restaurant Name] ([Address]) - [Cuisine type], [price range], [must-order dish]. [Reservation info]."
✓ "3:00 PM - [Neighborhood/Attraction] - [What makes it special]. [Practical details]."

CRITICAL: Your response must be ONLY valid JSON. Do not include markdown formatting or code blocks. Start your response with a curly brace and end with a curly brace.
{{
    "summary": "Compelling 2-3 sentence trip overview highlighting unique aspects",
    "itinerary": [
        {{
            "day": 1,
            "theme": "Descriptive theme for the day (e.g., 'Historic Paris & Left Bank Charm')",
            "activities": [
                "9:00 AM - [SPECIFIC VENUE with address] - [What to see/do, duration, cost, insider tip]",
                "1:00 PM - [SPECIFIC RESTAURANT with address] - [Cuisine, price, must-order dishes]",
                "3:30 PM - [SPECIFIC ATTRACTION] - [Description, logistics, why it's special]",
                "7:00 PM - [SPECIFIC DINNER/EXPERIENCE] - [Full details]"
            ],
            "highlights": ["Specific highlight 1", "Specific highlight 2", "Specific highlight 3"],
            "cultural_insight": "Fascinating cultural/historical insight specific to {destination} (2-3 sentences with real facts)",
            "local_secrets": "Insider tip locals know - specific street, cafe, viewpoint, or experience most tourists miss",
            "travel_tips": "Practical advice: transport card to buy, neighborhoods to stay, scams to avoid, local customs, payment methods"
        }}
    ],
    "estimated_budget": "{budget}",
    "cultural_insights": "Rich cultural overview of {destination} - history, customs, unique characteristics (3-4 sentences)",
    "local_recommendations": "Specific local favorites: best bakery, coffee spot, Sunday market, late-night eats, etc.",
    "travel_tips": "Essential practical tips: airport transfer options, best transport pass, tipping culture, sim card, safety notes",
    "ai_provider": "Dynamic AI Generation"
}}

Generate a DETAILED, SPECIFIC itinerary that reads like a professional concierge service, not a generic travel blog."""

    try:
        messages = [
            {"role": "system", "content": SYSTEM_INSTRUCTION},
            {"role": "user", "content": user_prompt}
        ]
        
        # Generate the itinerary using AI (detailed responses need more tokens)
        # For long trips (10+ days), we need higher token limit
        tokens_needed = min(6000, 500 * days)  # ~500 tokens per day, max 6000
        response = await generate_completion(messages, temperature=0.8, max_tokens=tokens_needed)
        
        # Try to parse the JSON response
        try:
            # Try to extract JSON from markdown code blocks if present
            json_text = response.strip()
            
            # Remove markdown code blocks if present
            if json_text.startswith("```json"):
                json_text = json_text[7:]  # Remove ```json
            elif json_text.startswith("```"):
                json_text = json_text[3:]  # Remove ```
            
            if json_text.endswith("```"):
                json_text = json_text[:-3]  # Remove trailing ```
            
            json_text = json_text.strip()
            
            # Try to find JSON object in the text
            if "{" in json_text and "}" in json_text:
                start = json_text.index("{")
                end = json_text.rindex("}") + 1
                json_text = json_text[start:end]
            
            itinerary_data = json.loads(json_text)
            
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
            logger.error(f"Failed to parse AI response as JSON: {e}")
            logger.error(f"Raw response (first 1000 chars): {response[:1000]}")
            logger.error(f"Raw response (last 200 chars): {response[-200:]}")
            
            # Try one more aggressive extraction
            try:
                # Look for JSON-like structure more aggressively
                import re
                json_match = re.search(r'\{[\s\S]*"itinerary"[\s\S]*\}', response)
                if json_match:
                    potential_json = json_match.group(0)
                    logger.info(f"Found potential JSON via regex, trying to parse...")
                    itinerary_data = json.loads(potential_json)
                    validated_itinerary = _validate_itinerary_response(
                        itinerary_data, destination, days, from_city, budget
                    )
                    logger.info(f"Successfully parsed via aggressive extraction!")
                    return validated_itinerary
            except Exception as extraction_error:
                logger.error(f"Aggressive extraction also failed: {extraction_error}")
            
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