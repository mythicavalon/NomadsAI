import os
import httpx
from typing import List, Dict, Optional

# Autofetch from multiple common env names
_DEF_BASE = (
	os.getenv("GPT_OSS_BASE_URL")
	or os.getenv("OPENAI_BASE_URL")
	or os.getenv("OPENROUTER_BASE_URL")
)
_DEF_KEY = (
	os.getenv("GPT_OSS_API_KEY")
	or os.getenv("OPENAI_API_KEY")
	or os.getenv("OPENROUTER_API_KEY")
)
_DEF_MODEL = os.getenv("GPT_OSS_MODEL") or os.getenv("OPENAI_MODEL") or "gpt-4o-mini-oss"


def is_configured() -> bool:
	return bool(_DEF_BASE and _DEF_KEY)


def chat(messages: List[Dict[str, str]], *, base_url: Optional[str] = None, api_key: Optional[str] = None, model: Optional[str] = None) -> str:
	base = (base_url or _DEF_BASE or "").rstrip("/")
	key = api_key or _DEF_KEY
	mdl = model or _DEF_MODEL
	if not base or not key:
		raise RuntimeError("GPT-OSS not configured")
	url = base + "/v1/chat/completions"
	headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
	payload = {"model": mdl, "messages": messages, "temperature": 0.7}
	with httpx.Client(timeout=60) as client:
		resp = client.post(url, headers=headers, json=payload)
		resp.raise_for_status()
		data = resp.json()
		return data["choices"][0]["message"]["content"].strip()