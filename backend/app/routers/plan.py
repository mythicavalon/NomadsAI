from fastapi import APIRouter, HTTPException
from typing import List
from ..models import TravelPlanRequest, TravelPlanResponse
from ..services.gpt_oss import generate_itinerary
from ..services.llm_client import is_configured
import json

router = APIRouter()

@router.post("/", response_model=TravelPlanResponse)
async def plan_travel(request: TravelPlanRequest):
    """
    Generate AI-powered travel itinerary with complete travel plan data.
    """
    try:
        # Validate request
        if not request.from_city or not request.destination:
            raise HTTPException(status_code=400, detail="Both from_city and destination are required")
        
        if not request.departure_date or not request.return_date:
            raise HTTPException(status_code=400, detail="Both departure_date and return_date are required")
        
        # Calculate days
        from datetime import datetime
        start_date = datetime.strptime(request.departure_date, "%Y-%m-%d")
        end_date = datetime.strptime(request.return_date, "%Y-%m-%d")
        days = (end_date - start_date).days + 1
        
        if days < 1 or days > 90:
            raise HTTPException(status_code=400, detail="Trip duration must be between 1 and 90 days")
        
        if request.travelers < 1 or request.travelers > 20:
            raise HTTPException(status_code=400, detail="Number of travelers must be between 1 and 20")
        
        if not request.interests:
            raise HTTPException(status_code=400, detail="At least one interest must be selected")
        
        # Generate itinerary using AI
        itinerary_data = await generate_itinerary(
            destination=request.destination,
            days=days,
            budget=request.budget,
            interests=request.interests,
            travel_month=start_date.strftime("%B"),
            from_city=request.from_city,
            travelers=request.travelers
        )
        
        # Debug logging
        print(f"DEBUG: itinerary_data type: {type(itinerary_data)}")
        print(f"DEBUG: itinerary_data content: {itinerary_data}")
        
        # Extract the structured data from the AI response
        try:
            if isinstance(itinerary_data, dict) and "day_plans" in itinerary_data:
                # AI response is properly structured
                summary = f"Your {days}-day journey from {request.from_city} to {request.destination}"
                itinerary = itinerary_data.get("day_plans", [])
                
                # Safely extract highlights - ensure it's a list
                highlights_raw = itinerary_data.get("surprise_picks", [])
                if isinstance(highlights_raw, list):
                    highlights = highlights_raw
                else:
                    highlights = [f"Explore {request.destination}", f"Experience local culture", f"Discover hidden gems"]
                
                estimated_budget = itinerary_data.get("estimated_budget", request.budget)
                cultural_insights = itinerary_data.get("cultural_insights", "Immerse yourself in local culture and traditions.")
                local_recommendations = itinerary_data.get("local_recommendations", "Explore authentic local experiences beyond tourist spots.")
                travel_tips = itinerary_data.get("travel_tips", f"Plan your trip from {request.from_city} to {request.destination} with local insights.")
                ai_provider = itinerary_data.get("ai_provider", "NVIDIA GPT-OSS-120B")
            else:
                # Fallback to basic structure
                summary = f"Your {days}-day journey from {request.from_city} to {request.destination}"
                itinerary = [{"day": i+1, "summary": f"Day {i+1} in {request.destination}", "activities": []} for i in range(days)]
                highlights = [f"Explore {request.destination}", f"Experience local culture", f"Discover hidden gems"]
                estimated_budget = request.budget
                cultural_insights = "Immerse yourself in local culture and traditions."
                local_recommendations = "Explore authentic local experiences beyond tourist spots."
                travel_tips = f"Plan your trip from {request.from_city} to {request.destination} with local insights."
                ai_provider = "Knowledge-based fallback"
        except Exception as e:
            print(f"DEBUG: Error processing itinerary_data: {e}")
            # Fallback to basic structure on any error
            summary = f"Your {days}-day journey from {request.from_city} to {request.destination}"
            itinerary = [{"day": i+1, "summary": f"Day {i+1} in {request.destination}", "activities": []} for i in range(days)]
            highlights = [f"Explore {request.destination}", f"Experience local culture", f"Discover hidden gems"]
            estimated_budget = request.budget
            cultural_insights = "Immerse yourself in local culture and traditions."
            local_recommendations = "Explore authentic local experiences beyond tourist spots."
            travel_tips = f"Plan your trip from {request.from_city} to {request.destination} with local insights."
            ai_provider = "Knowledge-based fallback"
        
        return TravelPlanResponse(
            summary=summary,
            itinerary=itinerary,
            highlights=highlights,
            estimated_budget=estimated_budget,
            cultural_insights=cultural_insights,
            local_recommendations=local_recommendations,
            travel_tips=travel_tips,
            ai_provider=ai_provider,
            from_city=request.from_city,
            destination=request.destination,
            total_days=days
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate travel plan: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check for the plan service"""
    return {
        "status": "healthy",
        "ai_configured": is_configured(),
        "service": "travel-planning"
    }