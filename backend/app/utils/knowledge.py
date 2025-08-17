import os
import json
from typing import Dict, Any

_KNOWLEDGE_DIR = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(__file__)), "knowledge"))

_CANON = {
	"barcelona": "barcelona",
	"barcelona, spain": "barcelona",
	"tokyo": "tokyo",
	"tokyo, japan": "tokyo",
	"new orleans": "new_orleans",
	"new orleans, usa": "new_orleans",
	"new orleans, united states": "new_orleans",
}


def canonicalize_city(name: str) -> str:
	key = name.lower().strip()
	return _CANON.get(key, key.replace(",", "").replace(" ", "_"))


def load_city_knowledge(city: str) -> Dict[str, Any] | None:
	canon = canonicalize_city(city)
	path = os.path.join(_KNOWLEDGE_DIR, f"{canon}.json")
	
	# Debug logging
	print(f"DEBUG: load_city_knowledge - city: {city}, canon: {canon}, path: {path}")
	
	if not os.path.exists(path):
		print(f"DEBUG: load_city_knowledge - path does not exist: {path}")
		return None
	
	with open(path, "r", encoding="utf-8") as f:
		data = json.load(f)
		print(f"DEBUG: load_city_knowledge - loaded data type: {type(data)}, content: {data}")
		return data