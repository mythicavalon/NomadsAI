"""
Stage 2: Knowledge Grounding / Data Retriever
Enriches skeleton itineraries with factual, destination-specific data.
"""

import json
import logging
import hashlib
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import sqlite3
from pathlib import Path
import numpy as np
from sentence_transformers import SentenceTransformer
from ..utils.knowledge import load_city_knowledge
from ..utils.mock_loader import load_events_for_city

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DataRetriever:
    """Retrieves and enriches itinerary data with factual information."""
    
    def __init__(self, db_path: str = "data/embeddings.db"):
        """Initialize the data retriever with embeddings database."""
        self.db_path = db_path
        self.model = SentenceTransformer('all-MiniLM-L6-v2')  # Lightweight embedding model
        self.cache = {}
        self.cache_ttl = timedelta(hours=24)
        self.cache_timestamps = {}
        
        # Initialize database
        self._init_database()
        
        # Load and index knowledge data
        self._load_knowledge_data()
    
    def _init_database(self):
        """Initialize the SQLite database for embeddings."""
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS embeddings (
                    id INTEGER PRIMARY KEY,
                    destination TEXT NOT NULL,
                    topic TEXT NOT NULL,
                    content TEXT NOT NULL,
                    embedding BLOB NOT NULL,
                    source TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_destination_topic 
                ON embeddings(destination, topic)
            """)
            
            conn.commit()
    
    def _load_knowledge_data(self):
        """Load and index knowledge data from various sources."""
        logger.info("Loading and indexing knowledge data...")
        
        # Load city knowledge data
        cities = ["london", "paris", "tokyo", "new york", "rome", "barcelona", "amsterdam", "berlin", "prague", "vienna"]
        
        for city in cities:
            try:
                # Load city knowledge
                knowledge = load_city_knowledge(city)
                if knowledge:
                    self._index_knowledge(city, "cultural_insight", knowledge.get("culture", ""))
                    self._index_knowledge(city, "local_secrets", knowledge.get("hidden_gems", ""))
                    self._index_knowledge(city, "travel_tips", knowledge.get("practical_info", ""))
                
                # Load city events
                events = load_events_for_city(city)
                if events:
                    for event in events[:10]:  # Limit to top 10 events
                        if isinstance(event, dict) and "name" in event:
                            self._index_knowledge(city, "activities", event["name"])
                            if "description" in event:
                                self._index_knowledge(city, "highlights", event["description"])
                
            except Exception as e:
                logger.warning(f"Failed to load data for {city}: {e}")
        
        logger.info("Knowledge data indexing completed")
    
    def _index_knowledge(self, destination: str, topic: str, content: str):
        """Index knowledge content in the embeddings database."""
        if not content or len(content.strip()) < 10:
            return
        
        try:
            # Generate embedding
            embedding = self.model.encode(content)
            
            # Store in database
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT OR REPLACE INTO embeddings 
                    (destination, topic, content, embedding, source) 
                    VALUES (?, ?, ?, ?, ?)
                """, (destination.lower(), topic, content, embedding.tobytes(), "knowledge_base"))
                conn.commit()
                
        except Exception as e:
            logger.warning(f"Failed to index knowledge for {destination}/{topic}: {e}")
    
    def query_retriever(self, destination: str, topic: str, limit: int = 3) -> List[Dict]:
        """
        Query the retriever for relevant content.
        
        Args:
            destination: Target destination city
            topic: Topic to search for (activities, highlights, cultural_insight, etc.)
            limit: Maximum number of results to return
            
        Returns:
            List of relevant content dictionaries
        """
        cache_key = f"{destination.lower()}_{topic}_{limit}"
        
        # Check cache first
        if cache_key in self.cache:
            timestamp = self.cache_timestamps.get(cache_key)
            if timestamp and datetime.now() - timestamp < self.cache_ttl:
                logger.info(f"Returning cached results for {cache_key}")
                return self.cache[cache_key]
        
        try:
            # Query database for relevant content
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute("""
                    SELECT content, source, destination 
                    FROM embeddings 
                    WHERE destination = ? AND topic = ?
                    ORDER BY created_at DESC
                    LIMIT ?
                """, (destination.lower(), topic, limit))
                
                results = []
                for row in cursor.fetchall():
                    results.append({
                        "content": row[0],
                        "source": row[1],
                        "destination": row[2]
                    })
                
                # Cache results
                self.cache[cache_key] = results
                self.cache_timestamps[cache_key] = datetime.now()
                
                logger.info(f"Retrieved {len(results)} results for {destination}/{topic}")
                return results
                
        except Exception as e:
            logger.error(f"Query retriever failed: {e}")
            return []
    
    def enrich_skeleton(self, skeleton: Dict) -> Dict:
        """
        Enrich a skeleton itinerary with factual data.
        
        Args:
            skeleton: The skeleton itinerary from Stage 1
            
        Returns:
            Enriched itinerary with factual data
        """
        logger.info("Enriching skeleton with factual data...")
        
        enriched = skeleton.copy()
        destination = skeleton.get("summary", "").split(" to ")[-1].split()[0].lower()
        
        # Enrich each day
        for day_data in enriched.get("itinerary", []):
            day_num = day_data.get("day", 1)
            logger.info(f"Enriching day {day_num}")
            
            # Enrich activities
            activities = day_data.get("activities", [])
            enriched_activities = []
            for activity in activities:
                if activity == "TBD" or len(activity.strip()) < 10:
                    # Try to find relevant activity data
                    relevant_data = self.query_retriever(destination, "activities", 1)
                    if relevant_data:
                        enriched_activities.append(relevant_data[0]["content"])
                    else:
                        enriched_activities.append(f"Explore {destination} attractions")
                else:
                    enriched_activities.append(activity)
            
            day_data["activities"] = enriched_activities
            
            # Enrich highlights
            highlights = day_data.get("highlights", [])
            enriched_highlights = []
            for highlight in highlights:
                if highlight == "TBD" or len(highlight.strip()) < 10:
                    relevant_data = self.query_retriever(destination, "highlights", 1)
                    if relevant_data:
                        enriched_highlights.append(relevant_data[0]["content"])
                    else:
                        enriched_highlights.append(f"Discover {destination} hidden gems")
                else:
                    enriched_highlights.append(highlight)
            
            day_data["highlights"] = enriched_highlights
            
            # Enrich cultural insight
            cultural_insight = day_data.get("cultural_insight", "")
            if cultural_insight == "TBD" or len(cultural_insight.strip()) < 20:
                relevant_data = self.query_retriever(destination, "cultural_insight", 1)
                if relevant_data:
                    day_data["cultural_insight"] = relevant_data[0]["content"]
                else:
                    day_data["cultural_insight"] = f"Immerse yourself in {destination}'s rich cultural heritage and local customs."
            
            # Enrich local secrets
            local_secrets = day_data.get("local_secrets", "")
            if local_secrets == "TBD" or len(local_secrets.strip()) < 20:
                relevant_data = self.query_retriever(destination, "local_secrets", 1)
                if relevant_data:
                    day_data["local_secrets"] = relevant_data[0]["content"]
                else:
                    day_data["local_secrets"] = f"Explore authentic experiences beyond typical tourist spots in {destination}."
            
            # Enrich travel tips
            travel_tips = day_data.get("travel_tips", "")
            if travel_tips == "TBD" or len(travel_tips.strip()) < 20:
                relevant_data = self.query_retriever(destination, "travel_tips", 1)
                if relevant_data:
                    day_data["travel_tips"] = relevant_data[0]["content"]
                else:
                    day_data["travel_tips"] = f"Plan your trip to {destination} with local insights and practical tips."
        
        # Update AI provider to show enrichment
        enriched["ai_provider"] = f"{enriched.get('ai_provider', 'Unknown')} + Knowledge Enrichment"
        
        logger.info("Skeleton enrichment completed")
        return enriched

def enrich_skeleton(skeleton: Dict) -> Dict:
    """Convenience function to enrich a skeleton."""
    retriever = DataRetriever()
    return retriever.enrich_skeleton(skeleton)

# Example usage
if __name__ == "__main__":
    # Test the data retriever
    retriever = DataRetriever()
    
    # Test query
    results = retriever.query_retriever("london", "cultural_insight", 2)
    print(f"Query results: {len(results)} items")
    for result in results:
        print(f"- {result['content'][:100]}...")
    
    # Test skeleton enrichment
    test_skeleton = {
        "summary": "Your 3-day journey to London",
        "itinerary": [
            {
                "day": 1,
                "theme": "Day 1: London introduction",
                "activities": ["TBD", "TBD", "TBD"],
                "highlights": ["TBD", "TBD"],
                "cultural_insight": "TBD",
                "local_secrets": "TBD",
                "travel_tips": "TBD"
            }
        ],
        "estimated_budget": "medium",
        "ai_provider": "Test"
    }
    
    enriched = retriever.enrich_skeleton(test_skeleton)
    print("\nEnriched skeleton:")
    print(json.dumps(enriched, indent=2))