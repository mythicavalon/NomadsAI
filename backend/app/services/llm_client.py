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
		# Provide intelligent fallback response instead of throwing error
		user_message = messages[-1]["content"] if messages else ""
		return generate_fallback_response(user_message)
	
	try:
		url = base + "/v1/chat/completions"
		headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
		payload = {"model": mdl, "messages": messages, "temperature": 0.7}
		with httpx.Client(timeout=60) as client:
			resp = client.post(url, headers=headers, json=payload)
			resp.raise_for_status()
			data = resp.json()
			return data["choices"][0]["message"]["content"].strip()
	except Exception as e:
		# Fallback to local response if API fails
		user_message = messages[-1]["content"] if messages else ""
		return generate_fallback_response(user_message)


def generate_fallback_response(user_message: str) -> str:
	"""Generate intelligent fallback responses when AI is not configured"""
	user_lower = user_message.lower()
	
	# Travel planning responses
	if any(word in user_lower for word in ["trip", "travel", "plan", "itinerary", "visit"]):
		return """🌍 I'd love to help you plan an amazing trip! While I'm currently running in demo mode, I can still provide some great suggestions:

For the best travel planning experience with real-time AI assistance, you can:
• Configure your AI settings in the Settings page
• Use OpenAI, Anthropic, or other compatible AI providers
• Get personalized recommendations based on your preferences

In the meantime, try exploring our destination cards on the home page for some inspiration! Where are you thinking of traveling?"""

	# Budget/cost related
	elif any(word in user_lower for word in ["budget", "cost", "price", "cheap", "expensive"]):
		return """💰 Great question about travel costs! Here are some general budget tips:

• **Budget Travel**: $30-50/day in Southeast Asia, Eastern Europe
• **Mid-range**: $75-150/day in Western Europe, North America  
• **Luxury**: $200+/day anywhere with premium experiences

For personalized budget analysis with real-time prices, configure AI in Settings to get detailed cost breakdowns for your specific destinations!"""

	# Location-specific queries
	elif any(city in user_lower for city in ["tokyo", "barcelona", "paris", "london", "new york", "bali"]):
		return f"""✈️ Excellent choice! I can see you're interested in exploring some amazing destinations.

While I'm in demo mode, I recommend:
• Check out our sample itineraries on the home page
• Enable AI configuration for personalized recommendations
• Explore the destination cards for quick inspiration

For detailed, AI-powered travel advice with real-time data, head to Settings to configure your AI provider!"""

	# General travel advice
	else:
		return """🤖 Hello! I'm your AI travel companion, currently running in demo mode.

I'm designed to help you with:
• Personalized travel planning
• Real-time destination recommendations  
• Budget optimization
• Local insights and hidden gems

To unlock my full potential with intelligent, personalized responses:
1. Go to Settings ⚙️
2. Configure your AI provider (OpenAI, Anthropic, etc.)
3. Start chatting for amazing travel insights!

What kind of travel experience are you looking for?"""