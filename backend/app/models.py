from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field
from pydantic import BaseModel
from datetime import date


class MemoryEntry(SQLModel, table=True):
	id: Optional[int] = Field(default=None, primary_key=True)
	title: str
	content: str
	destination: str
	created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

class TravelPlanRequest(BaseModel):
    from_city: str
    destination: str
    departure_date: str
    return_date: str
    travelers: int
    budget: str
    interests: List[str]

class TravelPlanResponse(BaseModel):
    summary: str
    itinerary: List[dict]
    highlights: List[str]
    estimated_budget: str
    cultural_insights: str
    local_recommendations: str
    travel_tips: str
    ai_provider: str
    from_city: str
    destination: str
    total_days: int