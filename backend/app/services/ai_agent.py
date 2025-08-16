"""
Advanced AI Agent with Memory, Tools, and Streaming
Core AI intelligence layer for Nomad AI 2.0
"""

import json
import asyncio
from typing import Dict, List, Optional, AsyncGenerator, Any
from datetime import datetime, timedelta
import httpx
from pydantic import BaseModel

from .llm_client import chat as basic_chat
from .web_search import search_web
from .wiki import fetch_top_attractions
from ..utils.knowledge import load_city_knowledge


class UserMemory(BaseModel):
    user_id: str
    preferences: Dict[str, Any] = {}
    travel_history: List[Dict[str, Any]] = []
    budget_patterns: Dict[str, Any] = {}
    interaction_count: int = 0
    last_active: datetime = datetime.now()


class TravelTool(BaseModel):
    name: str
    description: str
    parameters: Dict[str, Any]


class AIAgent:
    def __init__(self):
        self.memory_store: Dict[str, UserMemory] = {}
        self.tools = self._initialize_tools()
    
    def _initialize_tools(self) -> List[TravelTool]:
        """Initialize available tools for the AI agent"""
        return [
            TravelTool(
                name="search_web",
                description="Search the web for real-time travel information, news, deals, or events",
                parameters={
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "Search query"},
                        "location": {"type": "string", "description": "Location context (optional)"}
                    },
                    "required": ["query"]
                }
            ),
            TravelTool(
                name="get_attractions",
                description="Get detailed information about attractions and places in a destination",
                parameters={
                    "type": "object",
                    "properties": {
                        "destination": {"type": "string", "description": "City or destination name"},
                        "max_items": {"type": "integer", "description": "Maximum number of attractions", "default": 10}
                    },
                    "required": ["destination"]
                }
            ),
            TravelTool(
                name="analyze_budget",
                description="Analyze and provide budget recommendations for a destination",
                parameters={
                    "type": "object",
                    "properties": {
                        "destination": {"type": "string", "description": "Destination to analyze"},
                        "duration": {"type": "integer", "description": "Trip duration in days"},
                        "travel_style": {"type": "string", "description": "Travel style: budget, mid-range, luxury"}
                    },
                    "required": ["destination", "duration"]
                }
            ),
            TravelTool(
                name="update_preferences",
                description="Update user preferences based on conversation",
                parameters={
                    "type": "object",
                    "properties": {
                        "preferences": {"type": "object", "description": "User preferences to update"},
                        "user_id": {"type": "string", "description": "User identifier"}
                    },
                    "required": ["preferences", "user_id"]
                }
            )
        ]
    
    def get_user_memory(self, user_id: str) -> UserMemory:
        """Get or create user memory"""
        if user_id not in self.memory_store:
            self.memory_store[user_id] = UserMemory(user_id=user_id)
        return self.memory_store[user_id]
    
    def update_user_memory(self, user_id: str, updates: Dict[str, Any]):
        """Update user memory with new information"""
        memory = self.get_user_memory(user_id)
        
        if 'preferences' in updates:
            memory.preferences.update(updates['preferences'])
        
        if 'travel_history' in updates:
            memory.travel_history.extend(updates['travel_history'])
        
        if 'budget_patterns' in updates:
            memory.budget_patterns.update(updates['budget_patterns'])
        
        memory.interaction_count += 1
        memory.last_active = datetime.now()
    
    async def execute_tool(self, tool_name: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a tool and return results"""
        try:
            if tool_name == "search_web":
                query = parameters.get("query", "")
                location = parameters.get("location")
                if location:
                    query = f"{query} {location}"
                results = await search_web(query)
                return {"success": True, "results": results[:5]}  # Limit results
            
            elif tool_name == "get_attractions":
                destination = parameters.get("destination", "")
                max_items = parameters.get("max_items", 10)
                attractions = fetch_top_attractions(destination, max_items)
                return {"success": True, "attractions": attractions}
            
            elif tool_name == "analyze_budget":
                destination = parameters.get("destination", "")
                duration = parameters.get("duration", 3)
                travel_style = parameters.get("travel_style", "mid-range")
                
                # Mock budget analysis - in production, this would use real data
                base_costs = {"budget": 50, "mid-range": 120, "luxury": 300}
                daily_cost = base_costs.get(travel_style, 120)
                total_cost = daily_cost * duration
                
                return {
                    "success": True,
                    "analysis": {
                        "destination": destination,
                        "daily_cost": daily_cost,
                        "total_cost": total_cost,
                        "breakdown": {
                            "accommodation": daily_cost * 0.4,
                            "food": daily_cost * 0.3,
                            "activities": daily_cost * 0.2,
                            "transport": daily_cost * 0.1
                        }
                    }
                }
            
            elif tool_name == "update_preferences":
                user_id = parameters.get("user_id", "")
                preferences = parameters.get("preferences", {})
                self.update_user_memory(user_id, {"preferences": preferences})
                return {"success": True, "message": "Preferences updated"}
            
            else:
                return {"success": False, "error": f"Unknown tool: {tool_name}"}
        
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def build_system_prompt(self, user_memory: UserMemory) -> str:
        """Build personalized system prompt based on user memory"""
        base_prompt = """You are NomadAI, an advanced AI travel companion that learns and adapts to each user's preferences. You have access to real-time tools and data to provide the best travel advice.

Your personality: Enthusiastic, knowledgeable, personalized, and proactive. You remember past conversations and adapt to user preferences.

Available tools:
- search_web: For real-time travel information
- get_attractions: For destination details
- analyze_budget: For budget planning
- update_preferences: To learn about the user

Always use tools when you need current information or when you can learn more about the user."""
        
        if user_memory.preferences:
            prefs = ", ".join([f"{k}: {v}" for k, v in user_memory.preferences.items()])
            base_prompt += f"\n\nUser preferences: {prefs}"
        
        if user_memory.travel_history:
            recent_trips = user_memory.travel_history[-3:]  # Last 3 trips
            history = "; ".join([f"{trip.get('destination', 'Unknown')}" for trip in recent_trips])
            base_prompt += f"\n\nRecent travel history: {history}"
        
        if user_memory.interaction_count > 0:
            base_prompt += f"\n\nThis user has interacted {user_memory.interaction_count} times before."
        
        return base_prompt
    
    async def chat_stream(
        self,
        messages: List[Dict[str, str]], 
        user_id: str = "anonymous",
        destination: Optional[str] = None,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        model: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """Stream chat responses with tool usage"""
        
        user_memory = self.get_user_memory(user_id)
        system_prompt = self.build_system_prompt(user_memory)
        
        # Add system prompt and tools information
        enhanced_messages = [{"role": "system", "content": system_prompt}] + messages
        
        # Add tools information to the last user message
        if messages and messages[-1]["role"] == "user":
            tools_info = "\n\nAvailable tools: " + ", ".join([tool.name for tool in self.tools])
            enhanced_messages[-1]["content"] += tools_info
        
        try:
            # Check if we need to use tools
            user_query = messages[-1]["content"].lower() if messages else ""
            needs_search = any(keyword in user_query for keyword in ["current", "latest", "now", "today", "real-time", "price", "deal"])
            needs_attractions = any(keyword in user_query for keyword in ["attractions", "places", "visit", "see", "do"])
            needs_budget = any(keyword in user_query for keyword in ["budget", "cost", "price", "expensive", "cheap"])
            
            # Execute tools if needed
            tool_results = []
            if needs_search and destination:
                search_result = await self.execute_tool("search_web", {"query": user_query, "location": destination})
                tool_results.append(f"Search results: {json.dumps(search_result)}")
            
            if needs_attractions and destination:
                attractions_result = await self.execute_tool("get_attractions", {"destination": destination})
                tool_results.append(f"Attractions: {json.dumps(attractions_result)}")
            
            if needs_budget and destination:
                budget_result = await self.execute_tool("analyze_budget", {"destination": destination, "duration": 3})
                tool_results.append(f"Budget analysis: {json.dumps(budget_result)}")
            
            # Add tool results to context
            if tool_results:
                tool_context = "\n\nTool results:\n" + "\n".join(tool_results)
                enhanced_messages[-1]["content"] += tool_context
            
            # Generate response (for now, using basic chat - in production would use streaming)
            response = basic_chat(enhanced_messages, base_url=base_url, api_key=api_key, model=model)
            
            # Update user memory based on conversation
            if destination:
                self.update_user_memory(user_id, {
                    "travel_history": [{"destination": destination, "timestamp": datetime.now().isoformat()}]
                })
            
            # Stream the response word by word for better UX
            words = response.split()
            for i, word in enumerate(words):
                yield word + (" " if i < len(words) - 1 else "")
                await asyncio.sleep(0.05)  # Small delay for streaming effect
                
        except Exception as e:
            yield f"I apologize, but I encountered an error: {str(e)}"


# Global agent instance
ai_agent = AIAgent()