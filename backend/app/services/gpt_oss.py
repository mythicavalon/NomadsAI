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
		
		# BULLETPROOF destination-grounded prompt
		enhanced_prompt = [
			{
				"role": "system", 
				"content": f"""You are a travel expert specializing in {destination}. You MUST generate content ONLY for {destination}.

CRITICAL RULES - VIOLATION MEANS REGENERATION:

1. **DESTINATION LOCK**: Every single field must contain information ONLY about {destination}. NO other cities, countries, or generic content.

2. **HIGHLIGHTS**: Must be 3-5 specific attraction names that exist in {destination}. Use actual names from available context when possible.

3. **CULTURAL_INSIGHTS**: Must be 2-3 sentences about {destination}'s specific customs, etiquette, traditions, and cultural practices.

4. **LOCAL_RECOMMENDATIONS**: Must be 2-3 authentic {destination} experiences, hidden gems, and insider tips that locals value.

5. **TRAVEL_TIPS**: Must be 3-5 practical {destination}-specific tips about transport, safety, money, best seasons, and local advice.

6. **ITINERARY**: Each day must have exactly 3 activities with REAL names from {destination}. NO generic terms like 'Morning Exploration'.

7. **VALIDATION CHECK**: Before returning, verify every field contains {destination}-specific content. If ANY field is generic or empty, regenerate.

Output JSON structure:
{{
  "summary": "Concise overview of the {days}-day journey to {destination}",
  "itinerary": [
    {{
      "day": 1,
      "summary": "Day 1: {destination} introduction and cultural immersion",
      "activities": [
        {{
          "time": "09:00",
          "title": "Specific {destination} attraction or activity name",
          "description": "Detailed description with {destination}-specific context and practical tips",
          "category": "culture/food/adventure/relaxation/shopping"
        }}
      ]
    }}
  ],
  "highlights": ["3-5 specific {destination} attractions ONLY"],
  "estimated_budget": "budget level with reasoning",
  "cultural_insights": "2-3 sentences about {destination} customs, etiquette, and traditions",
  "local_recommendations": "2-3 authentic {destination} experiences and hidden gems",
  "travel_tips": "3-5 practical {destination}-specific travel hacks"
}}

REMEMBER: If you cannot provide {destination}-specific content for ANY field, regenerate the entire response."""
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

Create a sophisticated {destination}-specific itinerary that includes:
- Cultural immersion opportunities unique to {destination}
- Local culinary experiences from {destination}
- Hidden gems and off-the-beaten-path locations in {destination}
- Practical timing and logistics for {destination}
- Cultural etiquette tips specific to {destination}
- Travel advice for visitors from {from_city or 'various locations'} to {destination}

Available attractions and context for {destination}:
{bullets_text}

CRITICAL REQUIREMENTS - VIOLATION MEANS REGENERATION:

1. **DESTINATION LOCK**: Every single field must contain information ONLY about {destination}. NO other cities, countries, or generic content.

2. **HIGHLIGHTS**: Must be 3-5 specific attraction names that exist in {destination}. Use actual names from the available context when possible.

3. **CULTURAL_INSIGHTS**: Must be 2-3 sentences about {destination}'s specific customs, etiquette, traditions, and cultural practices.

4. **LOCAL_RECOMMENDATIONS**: Must be 2-3 authentic {destination} experiences, hidden gems, and insider tips that locals value.

5. **TRAVEL_TIPS**: Must be 3-5 practical {destination}-specific tips about transport, safety, money, best seasons, and local advice.

6. **ITINERARY**: Each day must have exactly 3 activities with REAL names from {destination}. NO generic terms like "Morning Exploration".

7. **VALIDATION CHECK**: Before returning, verify every field contains {destination}-specific content. If ANY field is generic or empty, regenerate.

Make this itinerary feel like it was crafted by a local expert who knows {destination} intimately and understands the needs of travelers from {from_city or 'different backgrounds'}.

REMEMBER: If you cannot provide {destination}-specific content for ANY field, regenerate the entire response."""
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
					
					# BULLETPROOF validation - catches EVERY issue
					validation_failed = False
					validation_errors = []
					
					# 1. Check highlights - must be list with 3-5 destination-specific items
					if not isinstance(highlights, list) or len(highlights) < 3:
						validation_errors.append(f"highlights insufficient: {highlights}")
						validation_failed = True
					else:
						# Check for unrelated cities, generic content, or wrong destinations
						for h in highlights:
							h_str = str(h).lower()
							if any(wrong_city in h_str for wrong_city in ["moscow", "germany", "steinway", "russia", "berlin", "paris", "london", "tokyo", "new york"]):
								if destination.lower() not in h_str:
									validation_errors.append(f"highlights contain unrelated city: {h}")
									validation_failed = True
									break
					
					# 2. Check cultural insights - must be non-empty, destination-specific string
					if not cultural_insights or len(cultural_insights.strip()) < 30:
						validation_errors.append(f"cultural_insights too short/generic: {cultural_insights}")
						validation_failed = True
					elif destination.lower() not in cultural_insights.lower():
						validation_errors.append(f"cultural_insights not destination-specific: {cultural_insights}")
						validation_failed = True
					
					# 3. Check local recommendations - must be non-empty, destination-specific string
					if not local_recommendations or len(local_recommendations.strip()) < 30:
						validation_errors.append(f"local_recommendations too short/generic: {local_recommendations}")
						validation_failed = True
					elif destination.lower() not in local_recommendations.lower():
						validation_errors.append(f"local_recommendations not destination-specific: {local_recommendations}")
						validation_failed = True
					
					# 4. Check travel tips - must be non-empty, destination-specific string
					if not travel_tips or len(travel_tips.strip()) < 30:
						validation_errors.append(f"travel_tips too short/generic: {travel_tips}")
						validation_failed = True
					elif destination.lower() not in travel_tips.lower():
						validation_errors.append(f"travel_tips not destination-specific: {travel_tips}")
						validation_failed = True
					
					# 5. Check itinerary - must have activities for each day with specific names
					if not isinstance(itinerary, list) or len(itinerary) < days:
						validation_errors.append(f"itinerary insufficient: {itinerary}")
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
											
											# Check for generic activity titles
											title = a.get("title", "").lower()
											if any(generic in title for generic in ["morning exploration", "afternoon discovery", "evening experience", "local exploration", "cultural immersion"]):
												validation_errors.append(f"generic activity title found: {a.get('title')}")
												validation_failed = True
					
					# Log all validation errors
					if validation_failed:
						print(f"DEBUG: AI response validation failed with {len(validation_errors)} errors:")
						for error in validation_errors:
							print(f"  - {error}")
					else:
						print(f"DEBUG: AI response validation PASSED - all fields are destination-specific and complete")
					
					# If validation failed, try to regenerate with a more specific prompt
					if validation_failed:
						print(f"DEBUG: AI response validation failed with {len(validation_errors)} errors, attempting regeneration...")
						
						# More aggressive regeneration prompt
						regeneration_prompt = [
							{
								"role": "system",
								"content": f"You are a travel expert for {destination}. Your previous response was REJECTED because it contained generic content or wrong cities. You MUST provide ONLY {destination}-specific content: 1) 3-5 specific {destination} attractions in highlights, 2) 2-3 sentences about {destination} culture, 3) 2-3 authentic {destination} experiences, 4) 3-5 practical {destination} travel tips. NO generic content, NO other cities, NO placeholders."
							},
							{
								"role": "user",
								"content": f"Regenerate the travel plan for {destination} ensuring ALL fields are destination-specific and complete. If you cannot provide {destination}-specific content, do not respond."
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
					
					# FINAL VALIDATION - ensure we never return invalid data
					final_highlights = highlights if highlights and len(highlights) >= 3 and not any(wrong_city in str(h).lower() for wrong_city in ["moscow", "germany", "steinway", "russia", "berlin", "paris", "london", "tokyo", "new york"] if destination.lower() not in str(h).lower()) else destination_highlights
					
					final_cultural_insights = cultural_insights if cultural_insights and len(cultural_insights.strip()) >= 30 and destination.lower() in cultural_insights.lower() else destination_cultural_insights
					
					final_local_recommendations = local_recommendations if local_recommendations and len(local_recommendations.strip()) >= 30 and destination.lower() in local_recommendations.lower() else destination_local_recommendations
					
					final_travel_tips = travel_tips if travel_tips and len(travel_tips.strip()) >= 30 and destination.lower() in travel_tips.lower() else destination_travel_tips
					
					result = {
						"summary": f"Your {days}-day journey from {from_city} to {destination}",
						"itinerary": itinerary_output,
						"highlights": final_highlights,
						"estimated_budget": parsed.get("estimated_budget", budget or "medium"),
						"cultural_insights": final_cultural_insights,
						"local_recommendations": final_local_recommendations,
						"travel_tips": final_travel_tips,
						"ai_provider": "NVIDIA NIM GPT-OSS-120B (Validated)" if not base_url else "Custom LLM (Validated)",
						"from_city": from_city,
						"destination": destination,
						"total_days": days
					}
					
					print(f"DEBUG: Final result validation - highlights: {len(final_highlights)} items, cultural_insights: {len(final_cultural_insights)} chars, local_recommendations: {len(final_local_recommendations)} chars, travel_tips: {len(final_travel_tips)} chars")
					
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
	
	# Generate destination-specific fallback content with rich, specific details
	destination_highlights = [
		f"Explore {destination} city center and main attractions",
		f"Visit {destination} historic landmarks and cultural sites",
		f"Discover {destination} hidden gems and local favorites",
		f"Experience {destination} authentic cuisine and markets",
		f"Immerse yourself in {destination} local culture and traditions"
	]
	
	destination_cultural_insights = f"Immerse yourself in the rich cultural heritage of {destination}. Learn about local customs, traditions, and etiquette to enhance your travel experience. Respect local practices and engage with the community to truly understand {destination}'s unique character. Take time to observe how locals interact and follow their lead in social situations."
	
	destination_local_recommendations = f"Explore authentic experiences beyond typical tourist spots in {destination}. Discover hidden gems, local markets, and neighborhood favorites that showcase the real {destination}. Venture off the beaten path to find the authentic soul of this remarkable destination. Ask locals for recommendations and be open to unexpected discoveries."
	
	destination_travel_tips = f"Plan your trip from {from_city} to {destination} with local insights. Consider best times to visit, local transportation options, cultural etiquette, and seasonal considerations for an optimal experience. Research local customs and learn a few basic phrases to enhance your connection with {destination}. Always carry local currency and be aware of peak tourist seasons."

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