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

CRITICAL REQUIREMENTS - ALL FIELDS MUST BE FILLED WITH DESTINATION-SPECIFIC CONTENT:

1. HIGHLIGHTS: Must contain 3-5 specific attraction names from the chosen destination ONLY. Never include attractions from other cities or countries.

2. CULTURAL_INSIGHTS: Must provide 2-3 sentences about local customs, etiquette, traditions, and cultural practices specific to the destination.

3. LOCAL_RECOMMENDATIONS: Must provide 2-3 authentic local experiences, hidden gems, and non-touristy tips that locals value in this destination.

4. TRAVEL_TIPS: Must provide 3-5 practical travel hacks including transport, safety, money, best seasons, and destination-specific advice.

5. ITINERARY: Each day must have exactly 3 activities with specific, real names (not generic terms like 'Morning Exploration').

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
  "highlights": ["3-5 specific attraction names from the destination ONLY"],
  "estimated_budget": "budget level with reasoning",
  "cultural_insights": "2-3 sentences about local customs, etiquette, and traditions of the destination",
  "local_recommendations": "2-3 authentic local experiences and hidden gems in this destination",
  "travel_tips": "3-5 practical travel hacks for this specific destination (transport, safety, money, best seasons)"
}

VALIDATION: Before returning, ensure every field contains destination-specific, non-empty content. If any field is missing or generic, regenerate the response."""
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

CRITICAL REQUIREMENTS - ALL FIELDS MUST BE DESTINATION-SPECIFIC:

1. **HIGHLIGHTS**: Must contain 3-5 specific attraction names from {destination} ONLY. Use actual names from the available context when possible.

2. **CULTURAL_INSIGHTS**: Must provide 2-3 sentences about local customs, etiquette, traditions, and cultural practices specific to {destination}.

3. **LOCAL_RECOMMENDATIONS**: Must provide 2-3 authentic local experiences, hidden gems, and non-touristy tips that locals value in {destination}.

4. **TRAVEL_TIPS**: Must provide 3-5 practical travel hacks for {destination} including transport, safety, money, best seasons, and destination-specific advice.

5. **ITINERARY**: Each day must have exactly 3 activities with REAL, SPECIFIC names from {destination}. NO generic terms like "Morning Exploration".

6. **VALIDATION**: Ensure every field contains destination-specific, non-empty content. If any field is missing or generic, regenerate.

Make this itinerary feel like it was crafted by a local expert who knows {destination} intimately and understands the needs of travelers from {from_city or 'different backgrounds'}."""
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
					
					# Enhanced validation and processing with comprehensive field checking
					itinerary = parsed.get("itinerary", [])
					highlights = parsed.get("highlights", [])
					cultural_insights = parsed.get("cultural_insights", "")
					local_recommendations = parsed.get("local_recommendations", "")
					travel_tips = parsed.get("travel_tips", "")
					
					print(f"DEBUG: itinerary type: {type(itinerary)}")
					print(f"DEBUG: itinerary content: {itinerary}")
					print(f"DEBUG: highlights type: {type(highlights)}")
					print(f"DEBUG: highlights content: {highlights}")
					print(f"DEBUG: cultural_insights: {cultural_insights}")
					print(f"DEBUG: local_recommendations: {local_recommendations}")
					print(f"DEBUG: travel_tips: {travel_tips}")
					
					# Validate that all required fields are present and destination-specific
					validation_failed = False
					
					# Check highlights - must be list with 3-5 destination-specific items
					if not isinstance(highlights, list) or len(highlights) < 3:
						print(f"DEBUG: Validation failed - highlights insufficient: {highlights}")
						validation_failed = True
					elif any("moscow" in str(h).lower() or "germany" in str(h).lower() or "steinway" in str(h).lower() for h in highlights):
						print(f"DEBUG: Validation failed - highlights contain unrelated cities: {highlights}")
						validation_failed = True
					
					# Check cultural insights - must be non-empty string
					if not cultural_insights or len(cultural_insights.strip()) < 20:
						print(f"DEBUG: Validation failed - cultural_insights too short: {cultural_insights}")
						validation_failed = True
					
					# Check local recommendations - must be non-empty string
					if not local_recommendations or len(local_recommendations.strip()) < 20:
						print(f"DEBUG: Validation failed - local_recommendations too short: {local_recommendations}")
						validation_failed = True
					
					# Check travel tips - must be non-empty string
					if not travel_tips or len(travel_tips.strip()) < 20:
						print(f"DEBUG: Validation failed - travel_tips too short: {travel_tips}")
						validation_failed = True
					
					# Check itinerary - must have activities for each day
					if not isinstance(itinerary, list) or len(itinerary) < days:
						print(f"DEBUG: Validation failed - itinerary insufficient: {itinerary}")
						validation_failed = True
					else:
						for d in itinerary:
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
					
					# If validation failed, try to regenerate with a more specific prompt
					if validation_failed:
						print(f"DEBUG: AI response validation failed, attempting regeneration...")
						regeneration_prompt = [
							{
								"role": "system",
								"content": f"You are a travel expert for {destination}. Your previous response was incomplete. You MUST provide: 1) 3-5 specific {destination} attractions in highlights, 2) 2-3 sentences about {destination} culture, 3) 2-3 authentic {destination} experiences, 4) 3-5 practical {destination} travel tips. NO generic content, NO other cities."
							},
							{
								"role": "user",
								"content": f"Regenerate the travel plan for {destination} ensuring ALL fields are destination-specific and complete."
							}
						]
						
						try:
							regeneration_resp = llm_chat(regeneration_prompt, base_url=base_url, api_key=api_key, model=model)
							regeneration_start = regeneration_resp.find('{')
							regeneration_end = regeneration_resp.rfind('}')
							if regeneration_start != -1 and regeneration_end != -1:
								regenerated_parsed = json.loads(regeneration_resp[regeneration_start:regeneration_end+1])
								print(f"DEBUG: Regenerated response: {regenerated_parsed}")
								
								# Use regenerated data if it's better
								if isinstance(regenerated_parsed, dict):
									itinerary = regenerated_parsed.get("itinerary", itinerary)
									highlights = regenerated_parsed.get("highlights", highlights)
									cultural_insights = regenerated_parsed.get("cultural_insights", cultural_insights)
									local_recommendations = regenerated_parsed.get("local_recommendations", local_recommendations)
									travel_tips = regenerated_parsed.get("travel_tips", travel_tips)
						except Exception as regen_e:
							print(f"DEBUG: Regeneration failed: {regen_e}")
					
					# Enhanced response with additional AI-generated insights - Convert to desired schema
					itinerary_output = []
					for d in itinerary:
						if isinstance(d, dict):
							activities = d.get("activities", [])
							day_activities = []
							for a in activities:
								if isinstance(a, dict):
									day_activities.append(f"{a.get('time', '')}: {a.get('title', '')}")
							
							itinerary_output.append({
								"day": d.get("day", 1),
								"title": d.get("summary", f"Day {d.get('day', 1)}"),
								"activities": day_activities
							})
					
					result = {
						"summary": f"Your {days}-day journey from {from_city} to {destination}",
						"itinerary": itinerary_output,
						"highlights": highlights if highlights and len(highlights) >= 3 else surprise_picks_for(destination),
						"estimated_budget": parsed.get("estimated_budget", budget or "medium"),
						"cultural_insights": cultural_insights if cultural_insights and len(cultural_insights.strip()) >= 20 else f"Immerse yourself in the local culture of {destination}. Learn about local customs, traditions, and etiquette to enhance your travel experience.",
						"local_recommendations": local_recommendations if local_recommendations and len(local_recommendations.strip()) >= 20 else f"Explore authentic experiences beyond typical tourist spots in {destination}. Discover hidden gems and local favorites that showcase the real {destination}.",
						"travel_tips": travel_tips if travel_tips and len(travel_tips.strip()) >= 20 else f"Plan your trip from {from_city} to {destination} with local insights. Consider best times to visit, local transportation, and cultural etiquette for a memorable experience.",
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
		
		# Generate destination-specific fallback content
		destination_highlights = [
			f"Explore {destination} city center and main attractions",
			f"Visit {destination} historic landmarks and cultural sites",
			f"Discover {destination} hidden gems and local favorites",
			f"Experience {destination} authentic cuisine and markets",
			f"Immerse yourself in {destination} local culture and traditions"
		]
		
		destination_cultural_insights = f"Immerse yourself in the rich cultural heritage of {destination}. Learn about local customs, traditions, and etiquette to enhance your travel experience. Respect local practices and engage with the community to truly understand {destination}'s unique character."
		
		destination_local_recommendations = f"Explore authentic experiences beyond typical tourist spots in {destination}. Discover hidden gems, local markets, and neighborhood favorites that showcase the real {destination}. Venture off the beaten path to find the authentic soul of this remarkable destination."
		
		destination_travel_tips = f"Plan your trip from {from_city} to {destination} with local insights. Consider best times to visit, local transportation options, cultural etiquette, and seasonal considerations for an optimal experience. Research local customs and learn a few basic phrases to enhance your connection with {destination}."

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
		"highlights": destination_highlights,
		"estimated_budget": budget or "medium",
		"cultural_insights": destination_cultural_insights,
		"local_recommendations": destination_local_recommendations,
		"travel_tips": destination_travel_tips,
		"ai_provider": "Knowledge-based fallback (Enhanced)",
		"from_city": from_city,
		"destination": destination,
		"total_days": days
	}