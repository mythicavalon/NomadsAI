from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict

from ..services import llm_client
from ..utils.knowledge import load_city_knowledge
from .signals import get_signals

router = APIRouter()


class ChatMessage(BaseModel):
	role: str
	content: str


class ChatRequest(BaseModel):
	messages: List[ChatMessage]
	destination: str | None = None


@router.post("/")
async def chat_endpoint(req: ChatRequest):
	try:
		if llm_client.is_configured():
			msgs = [{"role": m.role, "content": m.content} for m in req.messages]
			reply = llm_client.chat(msgs)
			return {"reply": reply, "provider": "gpt-oss"}

		# Fallback: synthesize guidance from local knowledge and signals
		city = req.destination or ""
		knowledge = load_city_knowledge(city) or {}
		signals = await get_signals(destination=city or None, region=None, limit=5)
		parts: List[str] = []
		if knowledge.get("landmarks"):
			land = ", ".join([x["name"] for x in knowledge["landmarks"][:5]])
			parts.append(f"Top landmarks: {land}.")
		if knowledge.get("food"):
			food = ", ".join([x["name"] for x in knowledge["food"][:3]])
			parts.append(f"Food experiences: {food}.")
		if signals:
			sig = "; ".join([f"{s['type']}: {s.get('name', s.get('to'))}" for s in signals[:3]])
			parts.append(f"Current signals: {sig}.")
		answer = " ".join(parts) or "Ask me about a city to get tailored picks."
		return {"reply": answer, "provider": "offline"}
	except Exception as exc:
		raise HTTPException(status_code=500, detail=str(exc))