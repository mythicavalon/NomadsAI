from fastapi import APIRouter, HTTPException
from typing import List
from ..models import TravelPlanRequest, TravelPlanResponse
from ..services.gpt_oss import generate_itinerary
from ..pipeline import generate_itinerary_pipeline
from ..services.llm_client import is_configured
import json
import logging

# Configure logging
logger = logging.getLogger(__name__)

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
        
        # Generate itinerary using the new standalone pipeline
        try:
            logger.info(f"Using standalone pipeline for {request.destination}")
            itinerary_data = generate_itinerary_pipeline(
                destination=request.destination,
                days=days,
                from_city=request.from_city,
                budget=request.budget,
                interests=request.interests
            )
            logger.info("Pipeline generation successful")
        except Exception as pipeline_error:
            logger.warning(f"Pipeline failed, falling back to legacy system: {pipeline_error}")
            # Fallback to legacy system
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
        print(f"DEBUG: Checking for 'itinerary' key: {'itinerary' in itinerary_data if isinstance(itinerary_data, dict) else 'Not a dict'}")
        print(f"DEBUG: Available keys: {list(itinerary_data.keys()) if isinstance(itinerary_data, dict) else 'Not a dict'}")
        
        # Extract the structured data from the pipeline response
        try:
            if isinstance(itinerary_data, dict) and "itinerary" in itinerary_data:
                # Pipeline response is properly structured with new schema
                summary = itinerary_data.get("summary", f"Your {days}-day journey from {request.from_city} to {request.destination}")
                itinerary = itinerary_data.get("itinerary", [])
                
                # Extract highlights from the first day's highlights
                highlights = []
                if itinerary and len(itinerary) > 0:
                    first_day = itinerary[0]
                    if "highlights" in first_day and isinstance(first_day["highlights"], list):
                        highlights = first_day["highlights"]
                
                if not highlights:
                    highlights = [f"Explore {request.destination}", f"Experience local culture", "Discover hidden gems"]
                
                # Extract cultural insights from the first day
                cultural_insights = ""
                if itinerary and len(itinerary) > 0:
                    first_day = itinerary[0]
                    if "cultural_insight" in first_day:
                        cultural_insights = first_day["cultural_insight"]
                
                if not cultural_insights:
                    cultural_insights = "Immerse yourself in local culture and traditions."
                
                # Extract local secrets from the first day
                local_recommendations = ""
                if itinerary and len(itinerary) > 0:
                    first_day = itinerary[0]
                    if "local_secrets" in first_day:
                        local_recommendations = first_day["local_secrets"]
                
                if not local_recommendations:
                    local_recommendations = "Explore authentic local experiences beyond tourist spots."
                
                # Extract travel tips from the first day
                travel_tips = ""
                if itinerary and len(itinerary) > 0:
                    first_day = itinerary[0]
                    if "travel_tips" in first_day:
                        travel_tips = first_day["travel_tips"]
                
                if not travel_tips:
                    travel_tips = f"Plan your trip from {request.from_city} to {request.destination} with local insights."
                
                estimated_budget = itinerary_data.get("estimated_budget", request.budget)
                ai_provider = itinerary_data.get("ai_provider", "Standalone Lightweight Pipeline")
                
                # Check if pipeline info is available
                pipeline_info = itinerary_data.get("pipeline_info", {})
                if pipeline_info:
                    logger.info(f"Pipeline stages completed: {pipeline_info.get('stages_completed', [])}")
            else:
                # Fallback to basic structure - match the frontend interface with destination-specific activities
                summary = f"Your {days}-day journey from {request.from_city} to {request.destination}"
                
                # Generate destination-specific activities based on common patterns
                destination_activities = [
                    f"09:00: Explore {request.destination} city center and main attractions",
                    f"14:00: Visit local landmarks and cultural sites in {request.destination}",
                    f"19:00: Experience {request.destination} nightlife and local cuisine"
                ]
                
                itinerary = [{"day": i+1, "summary": f"Day {i+1} in {request.destination}", "activities": destination_activities} for i in range(days)]
                highlights = [f"Explore {request.destination}", f"Experience local culture", f"Discover hidden gems"]
                estimated_budget = request.budget
                cultural_insights = "Immerse yourself in local culture and traditions."
                local_recommendations = "Explore authentic local experiences beyond tourist spots."
                travel_tips = f"Plan your trip from {request.from_city} to {request.destination} with local insights."
                ai_provider = "Knowledge-based fallback"
        except Exception as e:
            print(f"DEBUG: Error processing itinerary_data: {e}")
            # Fallback to basic structure on any error - match the frontend interface with destination-specific activities
            summary = f"Your {days}-day journey from {request.from_city} to {request.destination}"
            
            # Generate destination-specific activities based on common patterns
            destination_activities = [
                f"09:00: Explore {request.destination} city center and main attractions",
                f"14:00: Visit local landmarks and cultural sites in {request.destination}",
                f"19:00: Experience {request.destination} nightlife and local cuisine"
            ]
            
            itinerary = [{"day": i+1, "summary": f"Day {i+1} in {request.destination}", "activities": destination_activities} for i in range(days)]
            highlights = [f"Explore {request.destination}", f"Experience local culture", "Discover hidden gems"]
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