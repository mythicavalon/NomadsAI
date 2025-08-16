from fastapi import APIRouter, Query
from typing import List, Optional
from datetime import datetime
import json
import os

router = APIRouter()

MOCK_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "mock_data")


def _load_json(filename: str):
	path = os.path.abspath(os.path.join(MOCK_DIR, filename))
	with open(path, "r", encoding="utf-8") as f:
		return json.load(f)


@router.get("/")
async def get_signals(
	destination: Optional[str] = None,
	region: Optional[str] = None,
	limit: int = Query(50, ge=1, le=200),
):
	events = _load_json("events.json")
	flights = _load_json("flights.json")
	hotels = _load_json("hotels.json")

	results: List[dict] = []

	for ev in events:
		if destination and destination.lower() not in ev["location"].lower():
			continue
		if region and ev.get("region") != region:
			continue
		results.append({"type": "event", **ev})

	for fl in flights:
		if destination and destination.lower() not in fl["to"].lower():
			continue
		if region and fl.get("region") != region:
			continue
		results.append({"type": "flight_deal", **fl})

	for ho in hotels:
		if destination and destination.lower() not in ho["city"].lower():
			continue
		if region and ho.get("region") != region:
			continue
		results.append({"type": "hotel_rate", **ho})

	# Sort by recency or score if present
	def sort_key(item):
		date_str = item.get("date") or item.get("start_date") or item.get("found_at")
		if date_str:
			try:
				return datetime.fromisoformat(date_str)
			except Exception:
				return datetime.min
		return datetime.min

	results.sort(key=sort_key, reverse=True)
	return results[:limit]