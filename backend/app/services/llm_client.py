import os
import httpx
from typing import List, Dict

_BASE = os.getenv("GPT_OSS_BASE_URL")
_API_KEY = os.getenv("GPT_OSS_API_KEY")
_MODEL = os.getenv("GPT_OSS_MODEL", "gpt-4o-mini-oss")


def is_configured() -> bool:
	return bool(_BASE and _API_KEY)


def chat(messages: List[Dict[str, str]]) -> str:
	if not is_configured():
		raise RuntimeError("GPT-OSS not configured")
	url = _BASE.rstrip("/") + "/v1/chat/completions"
	headers = {"Authorization": f"Bearer {_API_KEY}", "Content-Type": "application/json"}
	payload = {"model": _MODEL, "messages": messages, "temperature": 0.7}
	with httpx.Client(timeout=60) as client:
		resp = client.post(url, headers=headers, json=payload)
		resp.raise_for_status()
		data = resp.json()
		return data["choices"][0]["message"]["content"].strip()