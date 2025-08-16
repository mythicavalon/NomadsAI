import os
from typing import List, Optional
from pydantic import BaseModel
import random

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
	hidden = [x["name"] for x in knowledge.get("hidden_gems", [])]
	if hidden:
		return [f"{name} — local hidden gem worth a detour" for name in hidden[:3]]
	# try wiki
	wiki = fetch_top_attractions(destination, max_items=3)
	if wiki:
		return [f"{w['title']} — {w['extract'][:90]}…" for w in wiki]
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
) -> dict:
	# If LLM configured, synthesize a plan using wiki attractions and preferences
	if llm_ready():
		attractions = fetch_top_attractions(destination, max_items=12)
		bullets = "\n".join([f"- {a['title']}: {a['extract'][:140]}" for a in attractions]) or "- city walk"
		prompt = [
			{"role": "system", "content": "You are an expert travel planner. Output a JSON with keys: day_plans (list of {day, summary, activities: [{time,title,description,category}]}), estimated_budget. Keep concise descriptions."},
			{"role": "user", "content": f"Destination: {destination}\nDays: {days}\nBudget: {budget or 'medium'}\nInterests: {', '.join(interests) or 'general'}\nTravel month: {travel_month or 'unspecified'}\nCandidate attractions and context:\n{bullets}"},
		]
		try:
			resp = llm_chat(prompt)
			# naive parse: find first '{' and last '}'
			start = resp.find('{')
			end = resp.rfind('}')
			if start != -1 and end != -1:
				import json as _json
				parsed = _json.loads(resp[start:end+1])
				# minimal normalization
				for d in parsed.get("day_plans", []):
					for a in d.get("activities", []):
						if "time" not in a: a["time"] = "09:00"
				return {
					"destination": destination,
					"days": days,
					"currency": "USD",
					"estimated_budget": parsed.get("estimated_budget", budget or "medium"),
					"day_plans": parsed.get("day_plans", []),
					"surprise_picks": surprise_picks_for(destination),
				}
		except Exception:
			pass

	# Fallback: knowledge-driven deterministic plan
	rng = random.Random(f"{destination}:{days}:{budget}:{','.join(interests)}:{travel_month}")
	events = load_events_for_city(destination)
	knowledge = load_city_knowledge(destination) or {}

	def pick_unique(pool: List[dict], k: int) -> List[dict]:
		if not pool:
			return []
		copy = pool[:]
		rng.shuffle(copy)
		return copy[:k]

	landmarks = knowledge.get("landmarks", [])
	food = knowledge.get("food", [])
	neigh = knowledge.get("neighborhoods", [])
	advent = knowledge.get("adventures", [])
	relax = knowledge.get("relax", [])

	day_plans: List[GeneratedDay] = []
	for i in range(1, days + 1):
		acts: List[GeneratedActivity] = []
		lm = pick_unique(landmarks, k=days*2)
		if lm:
			item = lm[(i - 1) % len(lm)]
			acts.append(GeneratedActivity(time="09:00", title=item["name"], description=item["description"], category=item.get("category", "explore")))
		else:
			wiki = fetch_top_attractions(destination, max_items=days*2)
			if wiki:
				w = wiki[(i - 1) % len(wiki)]
				acts.append(GeneratedActivity(time="09:00", title=w["title"], description=w["extract"][:140], category="explore"))

		if events:
			pick = events[(i - 1) % len(events)]
			acts.append(GeneratedActivity(time="13:00", title=f"Local event: {pick['name']}", description=f"At {pick['location']} — starts {pick.get('start_date','TBA')}", category="event"))
		else:
			fd = pick_unique(food, k=days)
			if fd:
				item = fd[(i - 1) % len(fd)]
				acts.append(GeneratedActivity(time="13:00", title=item["name"], description=item["description"], category="food"))

		ad = pick_unique(advent, k=days)
		if ad:
			item = ad[(i - 1) % len(ad)]
			acts.append(GeneratedActivity(time="16:00", title=item["name"], description=item["description"], category="adventure"))
		else:
			nb2 = pick_unique(neigh, k=days)
			if nb2:
				item = nb2[(i - 1) % len(nb2)]
				acts.append(GeneratedActivity(time="16:00", title=f"Explore {item['name']}", description=item["description"], category="explore"))

		fd2 = pick_unique(food, k=days*2)
		if fd2:
			item = fd2[(i - 1) % len(fd2)]
			acts.append(GeneratedActivity(time="19:00", title=item["name"], description=item["description"], category="food"))
		else:
			rel = pick_unique(relax, k=days)
			if rel:
				item = rel[(i - 1) % len(rel)]
				acts.append(GeneratedActivity(time="19:00", title=item["name"], description=item["description"], category="relax"))

		day_plans.append(GeneratedDay(day=i, summary=f"Day {i} in {destination}", activities=acts))

	estimated = budget or "medium"

	return GeneratedItinerary(
		destination=destination,
		days=days,
		estimated_budget=estimated,
		day_plans=day_plans,
		surprise_picks=surprise_picks_for(destination),
	).model_dump()