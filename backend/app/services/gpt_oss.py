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
  "summary": "Concise overview of the entire journey",
  "itinerary": [
    {
      "day": 1,
      "summary": "Brief theme/overview of the day",
      "activities": [
        {
          "time": "09:00",
          "title": "Specific activity name (e.g., 'Visit the British Museum')",
          "description": "Detailed description with cultural context and practical tips (1-2 sentences)",
          "category": "culture/food/adventure/relaxation/shopping"
        }
      ]
    }
  ],
  "highlights": ["3-5 must-see attractions or experiences"],
  "estimated_budget": "budget level with reasoning",
  "cultural_insights": "2-3 key cultural tips for this destination",
  "local_recommendations": "2-3 authentic local experiences beyond typical tourist spots",
  "travel_tips": "Practical advice for travelers from [FROM_CITY] visiting [DESTINATION]"
}

IMPORTANT: Each day must have exactly 3 activities with specific, real names (not generic terms like 'Morning Exploration'). Activities should be destination-specific and draw from the available attractions and local knowledge.

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

CRITICAL REQUIREMENTS:
1. Each day must have exactly 3 activities with REAL, SPECIFIC names
2. NO generic terms like "Morning Exploration", "Afternoon Discovery", or "Evening Experience"
3. Use actual attraction names from the available context when possible
4. Activities should be varied across days (don't repeat the same 3 activities)
5. Include specific times, realistic durations, and practical details

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
					
					# Enhanced response with additional AI-generated insights - Convert to desired schema
					itinerary = []
					for d in day_plans:
						if isinstance(d, dict):
							activities = d.get("activities", [])
							day_activities = []
							for a in activities:
								if isinstance(a, dict):
									day_activities.append(f"{a.get('time', '')}: {a.get('title', '')}")
							
							itinerary.append({
								"day": d.get("day", 1),
								"title": d.get("summary", f"Day {d.get('day', 1)}"),
								"activities": day_activities
							})
					
					result = {
						"summary": f"Your {days}-day journey from {from_city} to {destination}",
						"itinerary": itinerary,
						"highlights": surprise_picks_for(destination),
						"estimated_budget": parsed.get("estimated_budget", budget or "medium"),
						"cultural_insights": parsed.get("cultural_insights", f"Immerse yourself in the local culture of {destination}"),
						"local_recommendations": parsed.get("local_recommendations", f"Explore authentic experiences beyond typical tourist spots in {destination}"),
						"travel_tips": parsed.get("travel_tips", f"Plan your trip from {from_city} to {destination} with local insights"),
						"ai_provider": "NVIDIA NIM GPT-OSS-120B" if not base_url else "Custom LLM",
						"from_city": from_city,
						"destination": destination,
						"total_days": days
					}
					
					return result
					
				except json.JSONDecodeError as e:
					print(f"JSON parsing failed: {e}")
					# Fall through to deterministic generation
					pass
		except Exception as e:
			print(f"AI itinerary generation failed: {e}")
			# Try one more time with a simplified prompt
			try:
				print("Retrying AI generation with simplified prompt...")
				simple_prompt = [
					{
						"role": "system",
						"content": "You are a travel expert. Create a JSON itinerary with this exact structure: {\"summary\": \"journey overview\", \"itinerary\": [{\"day\": 1, \"summary\": \"day overview\", \"activities\": [{\"time\": \"09:00\", \"title\": \"specific activity name\", \"description\": \"activity description\"}]}], \"highlights\": [\"attraction 1\", \"attraction 2\"], \"estimated_budget\": \"budget level\", \"cultural_insights\": \"cultural tips\", \"local_recommendations\": \"local experiences\", \"travel_tips\": \"travel advice\"}"
					},
					{
						"role": "user",
						"content": f"Create a {days}-day itinerary for {destination} with 3 specific activities per day. Use real attraction names, not generic terms."
					}
				]
				
				resp = llm_chat(simple_prompt, base_url=base_url, api_key=api_key, model=model)
				start = resp.find('{')
				end = resp.rfind('}')
				if start != -1 and end != -1:
					parsed = json.loads(resp[start:end+1])
					if isinstance(parsed, dict) and "itinerary" in parsed:
						# Process the retry response
						itinerary = []
						for d in parsed.get("itinerary", []):
							if isinstance(d, dict):
								activities = d.get("activities", [])
								day_activities = []
								for a in activities:
									if isinstance(a, dict):
										day_activities.append(f"{a.get('time', '')}: {a.get('title', '')}")
								
								itinerary.append({
									"day": d.get("day", 1),
									"title": d.get("summary", f"Day {d.get('day', 1)}"),
									"activities": day_activities
								})
						
						result = {
							"summary": parsed.get("summary", f"Your {days}-day journey to {destination}"),
							"itinerary": itinerary,
							"highlights": parsed.get("highlights", [f"Explore {destination}", f"Experience local culture"]),
							"estimated_budget": parsed.get("estimated_budget", budget or "medium"),
							"cultural_insights": parsed.get("cultural_insights", f"Immerse yourself in the local culture of {destination}"),
							"local_recommendations": parsed.get("local_recommendations", f"Explore authentic experiences in {destination}"),
							"travel_tips": parsed.get("travel_tips", f"Plan your trip to {destination} with local insights"),
							"ai_provider": "NVIDIA NIM GPT-OSS-120B (Retry)" if not base_url else "Custom LLM (Retry)",
							"from_city": from_city,
							"destination": destination,
							"total_days": days
						}
						return result
			except Exception as retry_e:
				print(f"AI retry also failed: {retry_e}")
			
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

		# Enhanced day planning with better structure - Fixed for flat events list
	day_plans = []
	
	# Get available events for the destination
	available_events = []
	if isinstance(events, list):
		available_events = [e for e in events if isinstance(e, dict)]
	
	# Get available knowledge items
	available_food = []
	available_landmarks = []
	if isinstance(knowledge, dict):
		if "food" in knowledge and isinstance(knowledge["food"], list):
			available_food = [f for f in knowledge["food"] if isinstance(f, dict)]
		if "landmarks" in knowledge and isinstance(knowledge["landmarks"], list):
			available_landmarks = [l for l in knowledge["landmarks"] if isinstance(l, dict)]
	
	for day in range(1, days + 1):
		activities = []
		
		# Morning activity (9:00 AM) - Destination-specific
		if available_events and len(available_events) > 0:
			event = available_events[day % len(available_events)]
			if isinstance(event, dict):
				activities.append(GeneratedActivity(
					time="09:00",
					title=f"Visit {event.get('name', f'{destination} Attraction')}",
					description=f"Start your day exploring {event.get('name', f'local culture in {destination}')}",
					category="culture"
				))
		else:
			# Generate destination-specific morning activity
			morning_activities = [
				f"Explore {destination} city center",
				f"Visit {destination} main square",
				f"Discover {destination} historic district",
				f"Walk through {destination} central park",
				f"Tour {destination} old town"
			]
			activities.append(GeneratedActivity(
				time="09:00",
				title=morning_activities[day % len(morning_activities)],
				description=f"Begin your day discovering the heart of {destination}",
				category="culture"
			))
		
		# Afternoon activity (2:00 PM) - Destination-specific
		if available_landmarks and len(available_landmarks) > 0:
			landmark = available_landmarks[day % len(available_landmarks)]
			if isinstance(landmark, dict):
				activities.append(GeneratedActivity(
					time="14:00",
					title=f"Visit {landmark.get('name', f'{destination} Landmark')}",
					description=landmark.get("description", f"Explore this iconic destination in {destination}"),
					category="sightseeing"
				))
		else:
			# Generate destination-specific afternoon activity
			afternoon_activities = [
				f"Explore {destination} museums",
				f"Visit {destination} cultural sites",
				f"Discover {destination} hidden gems",
				f"Tour {destination} famous landmarks",
				f"Experience {destination} local markets"
			]
			activities.append(GeneratedActivity(
				time="14:00",
				title=afternoon_activities[day % len(afternoon_activities)],
				description=f"Immerse yourself in {destination}'s rich cultural heritage",
				category="sightseeing"
			))
		
		# Evening activity (7:00 PM) - Destination-specific
		if available_food and len(available_food) > 0:
			food_place = available_food[day % len(available_food)]
			if isinstance(food_place, dict):
				activities.append(GeneratedActivity(
					time="19:00",
					title=f"Dine at {food_place.get('name', f'{destination} Restaurant')}",
					description=food_place.get("description", f"Experience authentic {destination} cuisine"),
					category="food"
				))
		else:
			# Generate destination-specific evening activity
			evening_activities = [
				f"Experience {destination} nightlife",
				f"Enjoy {destination} local cuisine",
				f"Watch {destination} sunset views",
				f"Explore {destination} evening markets",
				f"Attend {destination} cultural events"
			]
			activities.append(GeneratedActivity(
				time="19:00",
				title=evening_activities[day % len(evening_activities)],
				description=f"End your day experiencing {destination}'s vibrant evening culture",
				category="evening"
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

	# Convert to the exact schema requested
	itinerary = []
	for dp in day_plans:
		day_data = dp.model_dump() if hasattr(dp, 'model_dump') else dp.dict()
		itinerary.append({
			"day": day_data.get("day", 1),
			"title": day_data.get("summary", f"Day {day_data.get('day', 1)}"),
			"activities": [f"{act.get('time', '')}: {act.get('title', '')}" for act in day_data.get("activities", [])]
		})
	
	return {
		"summary": f"Your {days}-day journey from {from_city} to {destination}",
		"itinerary": itinerary,
		"highlights": surprise_picks_for(destination),
		"estimated_budget": budget or "medium",
		"cultural_insights": f"Immerse yourself in the local culture of {destination}",
		"local_recommendations": f"Explore authentic experiences beyond typical tourist spots in {destination}",
		"travel_tips": f"Plan your trip from {from_city} to {destination} with local insights",
		"ai_provider": "Knowledge-based fallback",
		"from_city": from_city,
		"destination": destination,
		"total_days": days
	}