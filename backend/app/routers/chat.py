from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Optional
import json
import uuid

from ..services.ai_agent import ai_agent
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
	user_id: str | None = None
	stream: bool = True
	base_url: Optional[str] = None
	api_key: Optional[str] = None
	model: Optional[str] = None


class ChatStreamRequest(BaseModel):
	messages: List[ChatMessage]
	destination: str | None = None
	user_id: str | None = None
	base_url: Optional[str] = None
	api_key: Optional[str] = None
	model: Optional[str] = None


@router.post("/stream")
async def chat_stream_endpoint(req: ChatStreamRequest):
	"""Stream chat responses with AI agent"""
	try:
		user_id = req.user_id or str(uuid.uuid4())
		messages = [{"role": m.role, "content": m.content} for m in req.messages]
		
		async def generate():
			try:
				async for chunk in ai_agent.chat_stream(
					messages=messages,
					user_id=user_id,
					destination=req.destination,
					base_url=req.base_url,
					api_key=req.api_key,
					model=req.model
				):
					# Send Server-Sent Events format
					yield f"data: {json.dumps({'content': chunk, 'type': 'content'})}\n\n"
				
				# Send completion signal
				yield f"data: {json.dumps({'type': 'done'})}\n\n"
				
			except Exception as e:
				yield f"data: {json.dumps({'error': str(e), 'type': 'error'})}\n\n"
		
		return StreamingResponse(
			generate(), 
			media_type="text/plain",
			headers={
				"Cache-Control": "no-cache",
				"Connection": "keep-alive",
				"Access-Control-Allow-Origin": "*"
			}
		)
	except Exception as exc:
		raise HTTPException(status_code=500, detail=str(exc))


@router.post("/")
async def chat_endpoint(req: ChatRequest):
	"""Enhanced chat endpoint with AI agent support"""
	try:
		if req.stream:
			# Redirect to streaming endpoint
			return await chat_stream_endpoint(ChatStreamRequest(**req.model_dump()))
		
		user_id = req.user_id or str(uuid.uuid4())
		messages = [{"role": m.role, "content": m.content} for m in req.messages]
		
		# Collect streamed response
		full_response = ""
		async for chunk in ai_agent.chat_stream(
			messages=messages,
			user_id=user_id,
			destination=req.destination,
			base_url=req.base_url,
			api_key=req.api_key,
			model=req.model
		):
			full_response += chunk
		
		return {
			"reply": full_response,
			"provider": "nomad-ai-agent",
			"user_id": user_id,
			"has_memory": True
		}
		
	except Exception as exc:
		# Fallback to basic chat
		try:
			if llm_client.is_configured() or req.base_url:
				msgs = [{"role": m.role, "content": m.content} for m in req.messages]
				reply = llm_client.chat(msgs, base_url=req.base_url, api_key=req.api_key, model=req.model)
				return {"reply": reply, "provider": "gpt-oss", "fallback": True}

			# Final fallback: synthesize guidance from local knowledge and signals
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
				sig = "; ".join([f"{s['type']}: {s.get('title') or s.get('name') or s.get('to')}" for s in signals[:3]])
				parts.append(f"Current signals: {sig}.")
			answer = " ".join(parts) or "Ask me about a city to get tailored picks."
			return {"reply": answer, "provider": "offline", "fallback": True}
		except Exception as fallback_exc:
			raise HTTPException(status_code=500, detail=f"Chat failed: {str(exc)}, Fallback failed: {str(fallback_exc)}")


@router.get("/memory/{user_id}")
async def get_user_memory(user_id: str):
	"""Get user memory and preferences"""
	try:
		memory = ai_agent.get_user_memory(user_id)
		return {
			"user_id": memory.user_id,
			"preferences": memory.preferences,
			"travel_history": memory.travel_history[-10:],  # Last 10 trips
			"interaction_count": memory.interaction_count,
			"last_active": memory.last_active.isoformat()
		}
	except Exception as exc:
		raise HTTPException(status_code=500, detail=str(exc))


@router.post("/memory/{user_id}")
async def update_user_memory(user_id: str, updates: Dict):
	"""Update user memory and preferences"""
	try:
		ai_agent.update_user_memory(user_id, updates)
		return {"success": True, "message": "Memory updated successfully"}
	except Exception as exc:
		raise HTTPException(status_code=500, detail=str(exc))


@router.delete("/memory/{user_id}")
async def clear_user_memory(user_id: str):
	"""Clear user memory (GDPR compliance)"""
	try:
		if user_id in ai_agent.memory_store:
			del ai_agent.memory_store[user_id]
		return {"success": True, "message": "Memory cleared successfully"}
	except Exception as exc:
		raise HTTPException(status_code=500, detail=str(exc))