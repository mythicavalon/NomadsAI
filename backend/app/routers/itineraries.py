from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional

from ..services.gpt_oss import generate_itinerary, surprise_picks_for


class ItineraryRequest(BaseModel):
	destination: str = Field(..., description="City or destination name")
	days: int = Field(..., ge=1, le=21)
	budget: Optional[str] = Field(None, description="low|medium|high")
	interests: List[str] = Field(default_factory=list)
	travel_month: Optional[str] = None


class Activity(BaseModel):
	time: str
	title: str
	description: str
	category: Optional[str] = None


class DayPlan(BaseModel):
	day: int
	summary: str
	activities: List[Activity]


class ItineraryResponse(BaseModel):
	destination: str
	days: int
	currency: str = "USD"
	estimated_budget: Optional[str] = None
	day_plans: List[DayPlan]
	surprise_picks: List[str] = []


router = APIRouter()


@router.post("/", response_model=ItineraryResponse)
async def build_itinerary(payload: ItineraryRequest):
	try:
		return await generate_itinerary(
			destination=payload.destination,
			days=payload.days,
			budget=payload.budget,
			interests=payload.interests,
			travel_month=payload.travel_month,
		)
	except Exception as exc:
		raise HTTPException(status_code=500, detail=str(exc))


@router.get("/surprise")
async def surprise(destination: str = Query(..., description="City or destination")):
	try:
		return {"destination": destination, "picks": surprise_picks_for(destination)}
	except Exception as exc:
		raise HTTPException(status_code=500, detail=str(exc))