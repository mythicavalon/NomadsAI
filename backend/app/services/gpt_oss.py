import os
from typing import List, Optional
from pydantic import BaseModel

from ..utils.mock_loader import load_events_for_city


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
	# If a GPT-OSS API is available via env, you could integrate it here (Ollama/OpenAI-compatible).
	# To comply with "no paid APIs" and ensure offline demo, we return deterministic content
	# enriched with mock local events as "signals" and thematic activities.

	events = load_events_for_city(destination)

	categories = interests or ["culture", "food", "adventure"]
	day_plans: List[GeneratedDay] = []
	for i in range(1, days + 1):
		acts: List[GeneratedActivity] = []
		acts.append(GeneratedActivity(
			time="09:00",
			title=f"Neighborhood walk in {destination}",
			description=f"Explore iconic spots. Focus: {categories[(i-1) % len(categories)]}.",
			category="explore",
		))
		if events:
			pick = events[(i - 1) % len(events)]
			acts.append(GeneratedActivity(
				time="13:00",
				title=f"Local event: {pick['name']}",
				description=f"Attend at {pick['location']}. Starts {pick.get('start_date','TBA')}",
				category="event",
			))
		acts.append(GeneratedActivity(
			time="19:00",
			title="Dinner at a recommended spot",
			description="Try a beloved local restaurant for authentic flavors.",
			category="food",
		))

		day_plans.append(GeneratedDay(day=i, summary=f"Day {i} in {destination}", activities=acts))

	estimated = budget or "medium"

	return GeneratedItinerary(
		destination=destination,
		days=days,
		estimated_budget=estimated,
		day_plans=day_plans,
		surprise_picks=surprise_picks_for(destination),
	).model_dump()