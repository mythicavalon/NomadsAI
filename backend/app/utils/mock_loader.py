import os
import json
from typing import List, Dict

MOCK_DIR = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(__file__)), "mock_data"))


def _load(filename: str) -> List[Dict]:
	path = os.path.join(MOCK_DIR, filename)
	with open(path, "r", encoding="utf-8") as f:
		return json.load(f)


def load_events_for_city(city: str) -> List[Dict]:
	city_lower = city.lower()
	events = _load("events.json")
	
	# Debug logging
	print(f"DEBUG: load_events_for_city - city: {city}, events type: {type(events)}")
	print(f"DEBUG: load_events_for_city - events content: {events}")
	
	# Safely filter events, ensuring each event is a dictionary
	filtered_events = [e for e in events if isinstance(e, dict) and city_lower in e.get("location", "").lower()]
	
	print(f"DEBUG: load_events_for_city - filtered events: {filtered_events}")
	return filtered_events