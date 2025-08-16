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
	return [e for e in events if city_lower in e.get("location", "").lower()]