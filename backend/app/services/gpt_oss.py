import os
from typing import List, Optional
from pydantic import BaseModel
import random
import json

from ..utils.mock_loader import load_events_for_city
from ..utils.knowledge import load_city_knowledge
from .llm_client import is_configured as llm_ready, chat as llm_chat
from .wiki import fetch_top_attractions


class GeneratedActivity(BaseModel):
	time: str
	title: str
	description: str
	category: Optional[str] = None


class GeneratedDay(BaseModel):
	day: int
	summary: str
	activities: List[GeneratedActivity]


class GeneratedItinerary(BaseModel):
	destination: str
	days: int
	currency: str = "USD"
	estimated_budget: Optional[str] = None
	day_plans: List[GeneratedDay]
	surprise_picks: List[str]


def surprise_picks_for(destination: str) -> List[str]:
	knowledge = load_city_knowledge(destination) or {}
	
	# Safely extract hidden gems
	hidden_gems = knowledge.get("hidden_gems", [])
	hidden = []
	if isinstance(hidden_gems, list):
		for x in hidden_gems:
			if isinstance(x, dict) and "name" in x:
				hidden.append(x["name"])
	
	if hidden:
		return [f"{name} — local hidden gem worth a detour" for name in hidden[:3]]
	
	# try wiki
	wiki = fetch_top_attractions(destination, max_items=3)
	if wiki and isinstance(wiki, list):
		wiki_items = []
		for w in wiki:
			if isinstance(w, dict) and "title" in w and "extract" in w:
				wiki_items.append(f"{w['title']} — {w['extract'][:90]}…")
		if wiki_items:
			return wiki_items[:3]
	
	return [
		f"Hidden viewpoint in {destination}",
		f"Street food crawl in {destination}",
		f"Sunset by the waterfront in {destination}",
	]


async def generate_itinerary(
	destination: str,
	days: int,
	budget: Optional[str],
	interests: List[str],
	travel_month: Optional[str],
	from_city: Optional[str] = None,
	travelers: Optional[int] = 1,
	base_url: Optional[str] = None,
	api_key: Optional[str] = None,
	model: Optional[str] = None,
) -> dict:
	# Enhanced AI-powered itinerary generation using NVIDIA NIM GPT-OSS-120B
	if llm_ready() or base_url:
		attractions = fetch_top_attractions(destination, max_items=15)  # Increased for better context
		
		# Safely build bullets from attractions
		bullets = []
		if isinstance(attractions, list):
			for a in attractions:
				if isinstance(a, dict) and "title" in a and "extract" in a:
					bullets.append(f"- {a['title']}: {a['extract'][:160]}")
		
		bullets_text = "\n".join(bullets) if bullets else "- city walk"
		
		# Enhanced prompt for better AI understanding with from/to context
		enhanced_prompt = [
			{
				"role": "system", 
				"content": """You are an expert travel planner with deep knowledge of global destinations, cultural nuances, and luxury travel experiences. 
				
Your task is to create a sophisticated, personalized travel itinerary that balances must-see attractions with authentic local experiences.

Output a JSON with the following structure:
{
  "day_plans": [
    {
      "day": 1,
      "summary": "Brief theme/overview of the day",
      "activities": [
        {
          "time": "09:00",
          "title": "Activity name",
          "description": "Detailed description with cultural context and practical tips",
          "category": "culture/food/adventure/relaxation/shopping"
        }
      ]
    }
  ],
  "estimated_budget": "budget level with reasoning",
  "cultural_insights": "2-3 key cultural tips for this destination",
  "local_recommendations": "2-3 authentic local experiences beyond typical tourist spots",
  "travel_tips": "Practical advice for travelers from [FROM_CITY] visiting [DESTINATION]"
}

Keep descriptions engaging and informative. Consider local customs, best times to visit attractions, and practical travel tips."""
			},
			{
				"role": "user", 
				"content": f"""Travel Plan:
From: {from_city or 'Unknown'}
To: {destination}
Duration: {days} days
Budget: {budget or 'medium'}
Interests: {', '.join(interests) if interests else 'general exploration'}
Travel month: {travel_month or 'unspecified'}
Travelers: {travelers}

Please create a sophisticated itinerary that includes:
- Cultural immersion opportunities
- Local culinary experiences
- Hidden gems and off-the-beaten-path locations
- Practical timing and logistics
- Cultural etiquette tips
- Travel advice specific to visitors from {from_city or 'various locations'}

Available attractions and context:
{bullets_text}

Make this itinerary feel like it was crafted by a local expert who knows the destination intimately and understands the needs of travelers from {from_city or 'different backgrounds'}."""
			}
		]
		
		try:
			resp = llm_chat(enhanced_prompt, base_url=base_url, api_key=api_key, model=model)
			
			# Enhanced JSON parsing with better error handling
			start = resp.find('{')
			end = resp.rfind('}')
			if start != -1 and end != -1:
				import json as _json
				try:
					parsed = _json.loads(resp[start:end+1])
					print(f"DEBUG: Parsed AI response type: {type(parsed)}")
					print(f"DEBUG: Parsed AI response content: {parsed}")
					
					# Enhanced validation and processing
					day_plans = parsed.get("day_plans", [])
					print(f"DEBUG: day_plans type: {type(day_plans)}")
					print(f"DEBUG: day_plans content: {day_plans}")
					if isinstance(day_plans, list):
						for d in day_plans:
							if isinstance(d, dict):
								# Ensure required fields exist
								if "day" not in d:
									d["day"] = 1
								if "summary" not in d:
									d["summary"] = f"Day {d.get('day', 1)} exploration"
								
								activities = d.get("activities", [])
								if isinstance(activities, list):
									for a in activities:
										if isinstance(a, dict):
											if "time" not in a: 
												a["time"] = "09:00"
											if "title" not in a:
												a["title"] = "Local exploration"
											if "description" not in a:
												a["description"] = "Discover local culture and attractions"
											if "category" not in a:
												a["category"] = "culture"
					
					# Enhanced response with additional AI-generated insights
					result = {
						"destination": destination,
						"days": days,
						"currency": "USD",
						"estimated_budget": parsed.get("estimated_budget", budget or "medium"),
						"day_plans": day_plans,
						"surprise_picks": surprise_picks_for(destination),
						"ai_enhanced": True,
						"cultural_insights": parsed.get("cultural_insights", ""),
						"local_recommendations": parsed.get("local_recommendations", ""),
						"travel_tips": parsed.get("travel_tips", ""),
						"ai_provider": "NVIDIA NIM GPT-OSS-120B" if not base_url else "Custom LLM",
						"from_city": from_city,
						"travelers": travelers
					}
					
					return result
					
				except json.JSONDecodeError as e:
					print(f"JSON parsing failed: {e}")
					# Fall through to deterministic generation
					pass
		except Exception as e:
			print(f"AI itinerary generation failed: {e}")
			# Fall through to deterministic generation
			pass

	# Enhanced fallback: knowledge-driven deterministic plan with better structure
	rng = random.Random(f"{from_city}:{destination}:{days}:{budget}:{','.join(interests)}:{travel_month}")
	events = load_events_for_city(destination)
	knowledge = load_city_knowledge(destination) or {}
	
	# Debug logging
	print(f"DEBUG: events type: {type(events)}, content: {events}")
	print(f"DEBUG: knowledge type: {type(knowledge)}, content: {knowledge}")

	def pick_unique(pool: List[dict], k: int) -> List[dict]:
		if not pool or not isinstance(pool, list):
			return []
		# Filter to ensure only dictionaries are included
		valid_items = [item for item in pool if isinstance(item, dict)]
		if not valid_items:
			return []
		copy = valid_items[:]
		rng.shuffle(copy)
		return copy[:k]

	# Enhanced day planning with better structure
	day_plans = []
	for day in range(1, days + 1):
		# Morning activity
		morning_events = pick_unique(events.get("morning", []), 1)
		# Afternoon activity  
		afternoon_events = pick_unique(events.get("afternoon", []), 1)
		# Evening activity
		evening_events = pick_unique(events.get("evening", []), 1)
		
		activities = []
		if morning_events and len(morning_events) > 0 and isinstance(morning_events[0], dict):
			activities.append(GeneratedActivity(
				time="09:00",
				title=morning_events[0].get("name", "Morning Activity"),
				description=morning_events[0].get("description", "Start your day with local culture"),
				category="culture"
			))
		
		if afternoon_events and len(afternoon_events) > 0 and isinstance(afternoon_events[0], dict):
			activities.append(GeneratedActivity(
				time="14:00", 
				title=afternoon_events[0].get("name", "Afternoon Activity"),
				description=afternoon_events[0].get("description", "Explore local attractions"),
				category="exploration"
			))
			
		if evening_events and len(evening_events) > 0 and isinstance(evening_events[0], dict):
			activities.append(GeneratedActivity(
				time="19:00",
				title=evening_events[0].get("name", "Evening Activity"), 
				description=evening_events[0].get("description", "Evening cultural experience"),
				category="evening"
			))
		
		# Add local knowledge-based activities
		if knowledge.get("food") and day % 2 == 0:  # Every other day
			food_places = pick_unique(knowledge["food"], 1)
			if food_places and len(food_places) > 0 and isinstance(food_places[0], dict):
				activities.append(GeneratedActivity(
					time="12:00",
					title=f"Local Dining: {food_places[0].get('name', 'Local Restaurant')}",
					description=food_places[0].get("description", "Authentic local cuisine"),
					category="food"
				))
		
		if knowledge.get("landmarks") and day % 3 == 0:  # Every third day
			landmarks = pick_unique(knowledge["landmarks"], 1)
			if landmarks and len(landmarks) > 0 and isinstance(landmarks[0], dict):
				activities.append(GeneratedActivity(
					time="16:00",
					title=f"Landmark Visit: {landmarks[0].get('name', 'Local Landmark')}",
					description=landmarks[0].get("description", "Iconic destination landmark"),
					category="sightseeing"
				))
		
		# Ensure we have at least 3 activities per day
		while len(activities) < 3:
			activities.append(GeneratedActivity(
				time=f"{12 + len(activities) * 2}:00",
				title="Local Exploration",
				description="Discover hidden gems and local culture",
				category="exploration"
			))
		
		# Sort activities by time
		activities.sort(key=lambda x: x.time)
		
		day_plans.append(GeneratedDay(
			day=day,
			summary=f"Day {day}: {destination} exploration and cultural immersion",
			activities=activities
		))

	return {
		"destination": destination,
		"days": days,
		"currency": "USD",
		"estimated_budget": budget or "medium",
		"day_plans": [dp.model_dump() if hasattr(dp, 'model_dump') else dp.dict() for dp in day_plans],
		"surprise_picks": surprise_picks_for(destination),
		"ai_enhanced": False,
		"ai_provider": "Knowledge-based fallback",
		"from_city": from_city,
		"travelers": travelers
	}