import os
from typing import List, Optional
from pydantic import BaseModel
import random

from ..utils.mock_loader import load_events_for_city
from ..utils.knowledge import load_city_knowledge


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
	# Deterministic seed so the same inputs produce the same plan
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
		# Morning: landmark or neighborhood walk
		lm = pick_unique(landmarks, k=days*2)
		if lm:
			item = lm[(i - 1) % len(lm)]
			acts.append(GeneratedActivity(
				time="09:00",
				title=item["name"],
				description=item["description"],
				category=item.get("category", "explore"),
			))
		else:
			nb = pick_unique(neigh, k=days)
			if nb:
				item = nb[(i - 1) % len(nb)]
				acts.append(GeneratedActivity(time="09:00", title=f"Wander {item['name']}", description=item["description"], category="explore"))

		# Midday: event if any, else food
		if events:
			pick = events[(i - 1) % len(events)]
			acts.append(GeneratedActivity(
				time="13:00",
				title=f"Local event: {pick['name']}",
				description=f"At {pick['location']} — starts {pick.get('start_date','TBA')}",
				category="event",
			))
		else:
			fd = pick_unique(food, k=days)
			if fd:
				item = fd[(i - 1) % len(fd)]
				acts.append(GeneratedActivity(time="13:00", title=item["name"], description=item["description"], category="food"))

		# Afternoon: adventure or neighborhood
		ad = pick_unique(advent, k=days)
		if ad:
			item = ad[(i - 1) % len(ad)]
			acts.append(GeneratedActivity(time="16:00", title=item["name"], description=item["description"], category="adventure"))
		else:
			nb2 = pick_unique(neigh, k=days)
			if nb2:
				item = nb2[(i - 1) % len(nb2)]
				acts.append(GeneratedActivity(time="16:00", title=f"Explore {item['name']}", description=item["description"], category="explore"))

		# Evening: food or relax
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