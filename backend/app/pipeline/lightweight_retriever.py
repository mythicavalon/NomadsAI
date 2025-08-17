"""
Lightweight Data Retriever
Simplified version without heavy ML dependencies for quick deployment.
"""

import json
import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import sqlite3
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LightweightDataRetriever:
    """Lightweight retriever without ML dependencies."""
    
    def __init__(self, db_path: str = "data/embeddings.db"):
        """Initialize the lightweight retriever."""
        self.db_path = db_path
        self.cache = {}
        self.cache_ttl = timedelta(hours=24)
        self.cache_timestamps = {}
        
        # Initialize database
        self._init_database()
        
        # Load and index knowledge data
        self._load_knowledge_data()
    
    def _init_database(self):
        """Initialize the SQLite database for knowledge."""
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS knowledge (
                    id INTEGER PRIMARY KEY,
                    destination TEXT NOT NULL,
                    topic TEXT NOT NULL,
                    content TEXT NOT NULL,
                    source TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_destination_topic 
                ON knowledge(destination, topic)
            """)
            
            conn.commit()
    
    def _load_knowledge_data(self):
        """Load and index knowledge data from various sources."""
        logger.info("Loading and indexing knowledge data...")
        
        # Load city knowledge data
        cities = ["london", "paris", "tokyo", "new york", "rome", "barcelona", "amsterdam", "berlin"]
        
        for city in cities:
            try:
                # Load city knowledge
                knowledge = self._get_curated_knowledge(city)
                if knowledge:
                    self._index_knowledge(city, "cultural_insight", knowledge.get("culture", ""))
                    self._index_knowledge(city, "local_secrets", knowledge.get("hidden_gems", ""))
                    self._index_knowledge(city, "travel_tips", knowledge.get("practical_info", ""))
                    self._index_knowledge(city, "activities", knowledge.get("attractions", ""))
                
            except Exception as e:
                logger.warning(f"Failed to load data for {city}: {e}")
        
        logger.info("Knowledge data indexing completed")
    
    def _get_curated_knowledge(self, destination: str) -> Optional[Dict]:
        """Get curated knowledge data for a destination."""
        
        # This is a simplified version - in production you'd fetch from actual sources
        curated_data = {
            "london": {
                "culture": "London is a global city with a rich cultural heritage spanning over 2,000 years. The city is home to world-class museums, theaters, and historical landmarks.",
                "attractions": [
                    "British Museum - One of the world's greatest collections of art and artifacts",
                    "Tower of London - Historic castle and fortress on the north bank of the River Thames",
                    "Buckingham Palace - Official residence of the British monarch",
                    "Big Ben - Iconic clock tower at the north end of the Houses of Parliament",
                    "London Eye - Giant observation wheel on the South Bank of the River Thames"
                ],
                "hidden_gems": [
                    "Leadenhall Market - Beautiful covered market in the City of London",
                    "Neal's Yard - Colorful courtyard in Covent Garden",
                    "Postman's Park - Peaceful park with memorial plaques",
                    "Little Venice - Picturesque canal area in Maida Vale"
                ],
                "practical_info": "London has an extensive public transport network including the Underground (Tube), buses, and trains. The Oyster card is the most convenient way to pay for transport. Many museums are free to enter."
            },
            "paris": {
                "culture": "Paris is the capital of France and a global center for art, fashion, gastronomy, and culture. The city is known for its romantic atmosphere and artistic heritage.",
                "attractions": [
                    "Eiffel Tower - Iconic iron lattice tower on the Champ de Mars",
                    "Louvre Museum - World's largest art museum and historic monument",
                    "Notre-Dame Cathedral - Medieval Catholic cathedral on Île de la Cité",
                    "Arc de Triomphe - Monument at the western end of the Champs-Élysées",
                    "Sacré-Cœur - Roman Catholic church on the summit of Montmartre"
                ],
                "hidden_gems": [
                    "Parc des Buttes-Chaumont - Beautiful park with dramatic cliffs and waterfalls",
                    "Rue Crémieux - Colorful street in the 12th arrondissement",
                    "Passage Brady - Covered passage with Indian restaurants and shops",
                    "Square du Vert-Galant - Small park at the western tip of Île de la Cité"
                ],
                "practical_info": "Paris has an excellent metro system. The Paris Museum Pass can save money on museum admissions. Many restaurants close between lunch and dinner service."
            },
            "tokyo": {
                "culture": "Tokyo is the capital of Japan and a fascinating blend of ultramodern and traditional elements. The city offers a unique mix of cutting-edge technology and ancient traditions.",
                "attractions": [
                    "Senso-ji Temple - Ancient Buddhist temple in Asakusa",
                    "Tokyo Skytree - Broadcasting tower and observation deck",
                    "Shibuya Crossing - Famous pedestrian crossing and symbol of Tokyo",
                    "Meiji Shrine - Shinto shrine dedicated to Emperor Meiji",
                    "Tsukiji Outer Market - Famous fish market and food area"
                ],
                "hidden_gems": [
                    "Yanaka Ginza - Traditional shopping street with old Tokyo atmosphere",
                    "Kagurazaka - Historic area with French influence and hidden alleys",
                    "Kappabashi Street - Kitchen and restaurant supply district",
                    "Shimokitazawa - Bohemian neighborhood known for vintage shopping"
                ],
                "practical_info": "Tokyo has an extensive and punctual subway system. The Japan Rail Pass is useful for longer stays. Many restaurants have vending machine ordering systems."
            }
        }
        
        return curated_data.get(destination.lower())
    
    def _index_knowledge(self, destination: str, topic: str, content: str):
        """Index knowledge content in the database."""
        if not content or len(content.strip()) < 10:
            return
        
        try:
            # Store in database
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT OR REPLACE INTO knowledge 
                    (destination, topic, content, source) 
                    VALUES (?, ?, ?, ?)
                """, (destination.lower(), topic, content, "curated_knowledge"))
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
                    FROM knowledge 
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
    retriever = LightweightDataRetriever()
    return retriever.enrich_skeleton(skeleton)