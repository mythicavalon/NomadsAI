import requests
from typing import List, Dict

API = "https://en.wikipedia.org/w/api.php"


def fetch_top_attractions(city: str, max_items: int = 8) -> List[Dict]:
	query = f"{city} landmarks OR attractions OR points of interest"
	params = {
		"action": "query",
		"format": "json",
		"prop": "extracts",
		"exintro": 1,
		"explaintext": 1,
		"generator": "search",
		"gsrsearch": query,
		"gsrlimit": max_items,
	}
	r = requests.get(API, params=params, timeout=15)
	r.raise_for_status()
	data = r.json()
	pages = data.get("query", {}).get("pages", {})
	items: List[Dict] = []
	for _, page in pages.items():
		title = page.get("title")
		extract = (page.get("extract") or "").strip()
		if title and extract:
			items.append({"title": title, "extract": extract})
	return items[:max_items]