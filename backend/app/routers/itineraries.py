from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from ..services.gpt_oss import generate_itinerary
from ..services.llm_client import is_configured

router = APIRouter()

class TravelPlanRequest(BaseModel):
	from_city: str
	destination: str
	days: int
	budget: Optional[str] = "premium"
	interests: Optional[List[str]] = ["business", "culture"]
	travelers: Optional[int] = 1
	departure_date: Optional[str] = None
	return_date: Optional[str] = None

class TravelPlanResponse(BaseModel):
	itinerary: dict
	ai_enhanced: bool
	ai_provider: str
	from_city: str
	destination: str
	total_days: int
	estimated_budget: str

@router.post("/plan", response_model=TravelPlanResponse)
async def plan_travel(request: TravelPlanRequest):
	"""
	Generate AI-powered travel itinerary with proper from/to destinations.
	"""
	try:
		# Validate request
		if not request.from_city or not request.destination:
			raise HTTPException(status_code=400, detail="Both from_city and destination are required")
		
		if request.days < 1 or request.days > 90:
			raise HTTPException(status_code=400, detail="Days must be between 1 and 90")
		
		# Generate itinerary using AI
		itinerary_data = await generate_itinerary(
			destination=request.destination,
			days=request.days,
			budget=request.budget,
			interests=request.interests,
			travel_month=None,  # Could be extracted from departure_date
			from_city=request.from_city,
			travelers=request.travelers
		)
		
		return TravelPlanResponse(
			itinerary=itinerary_data,
			ai_enhanced=itinerary_data.get("ai_enhanced", False),
			ai_provider=itinerary_data.get("ai_provider", "Knowledge-based fallback"),
			from_city=request.from_city,
			destination=request.destination,
			total_days=request.days,
			estimated_budget=itinerary_data.get("estimated_budget", request.budget)
		)
		
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"Failed to generate itinerary: {str(e)}")

@router.get("/surprise")
async def get_surprise_destinations():
	"""
	Get AI-generated surprise destination recommendations.
	"""
	try:
		# Use AI to generate surprise destinations
		if is_configured():
			# This would use the LLM to generate creative destination suggestions
			suggestions = [
				"Hidden gem: Chefchaouen, Morocco - The Blue Pearl of North Africa",
				"Emerging destination: Tbilisi, Georgia - Where East meets West",
				"Cultural immersion: Varanasi, India - Spiritual capital of India",
				"Adventure awaits: Patagonia, Chile - Untamed wilderness",
				"Urban exploration: Medellín, Colombia - City of eternal spring"
			]
		else:
			suggestions = [
				"Barcelona, Spain - Mediterranean charm and Gaudí architecture",
				"Tokyo, Japan - Perfect blend of tradition and innovation",
				"Lisbon, Portugal - Coastal charm and European sophistication",
				"Mexico City, Mexico - Rich culture and culinary excellence",
				"Dubai, UAE - Futuristic luxury and desert adventures"
			]
		
		return {"suggestions": suggestions}
		
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"Failed to get surprise destinations: {str(e)}")

@router.get("/destinations")
async def get_available_destinations():
	"""
	Get list of available destinations for the frontend.
	"""
	destinations = [
		{"name": "New York", "country": "United States", "code": "NYC", "category": "business"},
		{"name": "London", "country": "United Kingdom", "code": "LON", "category": "business"},
		{"name": "Tokyo", "country": "Japan", "code": "TYO", "category": "business"},
		{"name": "Paris", "country": "France", "code": "PAR", "category": "culture"},
		{"name": "Barcelona", "country": "Spain", "code": "BCN", "category": "culture"},
		{"name": "Singapore", "country": "Singapore", "code": "SIN", "category": "business"},
		{"name": "Dubai", "country": "UAE", "code": "DXB", "category": "business"},
		{"name": "Bangkok", "country": "Thailand", "code": "BKK", "category": "culture"},
		{"name": "Mexico City", "country": "Mexico", "code": "MEX", "category": "culture"},
		{"name": "Cape Town", "country": "South Africa", "code": "CPT", "category": "leisure"}
	]
	
	return {"destinations": destinations}