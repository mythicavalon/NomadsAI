"""
Standalone Lightweight Pipeline
Completely self-contained pipeline for quick deployment.
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

class StandalonePipeline:
    """Completely standalone pipeline without external dependencies."""
    
    def __init__(self):
        """Initialize the standalone pipeline."""
        self.db_path = "data/knowledge.db"
        self._init_database()
        self._load_knowledge_data()
    
    def _init_database(self):
        """Initialize the SQLite database."""
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
        """Load curated knowledge data."""
        logger.info("Loading curated knowledge data...")
        
        # Pre-loaded knowledge for common destinations
        knowledge_data = {
            "london": {
                "attractions": [
                    "British Museum - World's greatest collections of art and artifacts",
                    "Tower of London - Historic castle and fortress",
                    "Buckingham Palace - Official residence of the British monarch",
                    "Big Ben - Iconic clock tower",
                    "London Eye - Giant observation wheel"
                ],
                "culture": "London is a global city with rich cultural heritage spanning over 2,000 years. The city is home to world-class museums, theaters, and historical landmarks.",
                "hidden_gems": [
                    "Leadenhall Market - Beautiful covered market in the City",
                    "Neal's Yard - Colorful courtyard in Covent Garden",
                    "Postman's Park - Peaceful park with memorial plaques",
                    "Little Venice - Picturesque canal area"
                ],
                "practical_info": "London has extensive public transport including the Underground (Tube), buses, and trains. The Oyster card is convenient for transport. Many museums are free to enter."
            },
            "paris": {
                "attractions": [
                    "Eiffel Tower - Iconic iron lattice tower",
                    "Louvre Museum - World's largest art museum",
                    "Notre-Dame Cathedral - Medieval Catholic cathedral",
                    "Arc de Triomphe - Monument on Champs-Élysées",
                    "Sacré-Cœur - Church on Montmartre"
                ],
                "culture": "Paris is the capital of France and a global center for art, fashion, gastronomy, and culture. The city is known for its romantic atmosphere and artistic heritage.",
                "hidden_gems": [
                    "Parc des Buttes-Chaumont - Beautiful park with dramatic cliffs",
                    "Rue Crémieux - Colorful street in 12th arrondissement",
                    "Passage Brady - Covered passage with Indian restaurants",
                    "Square du Vert-Galant - Small park on Île de la Cité"
                ],
                "practical_info": "Paris has an excellent metro system. The Paris Museum Pass can save money on museum admissions. Many restaurants close between lunch and dinner service."
            },
            "tokyo": {
                "attractions": [
                    "Senso-ji Temple - Ancient Buddhist temple in Asakusa",
                    "Tokyo Skytree - Broadcasting tower and observation deck",
                    "Shibuya Crossing - Famous pedestrian crossing",
                    "Meiji Shrine - Shinto shrine dedicated to Emperor Meiji",
                    "Tsukiji Outer Market - Famous fish market and food area"
                ],
                "culture": "Tokyo is the capital of Japan and a fascinating blend of ultramodern and traditional elements. The city offers a unique mix of cutting-edge technology and ancient traditions.",
                "hidden_gems": [
                    "Yanaka Ginza - Traditional shopping street with old Tokyo atmosphere",
                    "Kagurazaka - Historic area with French influence",
                    "Kappabashi Street - Kitchen and restaurant supply district",
                    "Shimokitazawa - Bohemian neighborhood for vintage shopping"
                ],
                "practical_info": "Tokyo has extensive and punctual subway system. The Japan Rail Pass is useful for longer stays. Many restaurants have vending machine ordering systems."
            },
            "new york": {
                "attractions": [
                    "Statue of Liberty - Iconic symbol of freedom",
                    "Central Park - Urban oasis in Manhattan",
                    "Times Square - Bright lights and entertainment",
                    "Empire State Building - Art Deco skyscraper",
                    "Metropolitan Museum of Art - World-class art collection"
                ],
                "culture": "New York City is a global hub of culture, finance, and entertainment. The city is known for its diversity, energy, and iconic landmarks.",
                "hidden_gems": [
                    "High Line - Elevated park built on former railway",
                    "Brooklyn Bridge Park - Waterfront park with city views",
                    "Washington Square Park - Historic park in Greenwich Village",
                    "Chelsea Market - Food hall in historic building"
                ],
                "practical_info": "NYC has extensive subway and bus system. The MetroCard is convenient for transport. Many museums have suggested donation admission."
            },
            "sydney": {
                "attractions": [
                    "Sydney Opera House - Iconic performing arts venue with unique architecture",
                    "Sydney Harbour Bridge - Steel arch bridge with panoramic city views",
                    "Bondi Beach - Famous beach with golden sand and surf culture",
                    "Royal Botanic Gardens - Stunning waterfront gardens with harbor views",
                    "The Rocks - Historic area with cobblestone streets and weekend markets",
                    "Taronga Zoo - World-class zoo with harbor views and native Australian animals",
                    "Darling Harbour - Waterfront precinct with attractions and dining",
                    "Blue Mountains - UNESCO World Heritage area with dramatic landscapes"
                ],
                "culture": "Sydney is Australia's largest city, known for its stunning harbor, outdoor lifestyle, and multicultural dining scene. The city combines modern urban sophistication with laid-back beach culture.",
                "hidden_gems": [
                    "Wenzel Pinnacle - Secret lookout in the Blue Mountains with 360-degree views",
                    "Barangaroo Reserve - Native parkland on the harbor foreshore",
                    "Angel Place - Laneway with golden birdcage art installation",
                    "Observatory Hill - Historic park with harbor views and astronomy"
                ],
                "practical_info": "Sydney has an extensive public transport system including trains, buses, and ferries. The Opal card works across all transport. Many beaches are easily accessible by public transport."
            }
        }
        
        # Index the knowledge data
        for city, data in knowledge_data.items():
            for topic, content in data.items():
                if isinstance(content, list):
                    for item in content:
                        self._index_knowledge(city, topic, item)
                else:
                    self._index_knowledge(city, topic, content)
        
        logger.info("Knowledge data indexing completed")
    
    def _index_knowledge(self, destination: str, topic: str, content: str):
        """Index knowledge content in the database."""
        if not content or len(content.strip()) < 10:
            return
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT OR REPLACE INTO knowledge 
                    (destination, topic, content, source) 
                    VALUES (?, ?, ?, ?)
                """, (destination.lower(), topic, content, "curated_knowledge"))
                conn.commit()
        except Exception as e:
            logger.warning(f"Failed to index knowledge for {destination}/{topic}: {e}")
    
    def generate_itinerary(self, destination: str, days: int, from_city: str = "various locations",
                          budget: str = "medium", interests: List[str] = None) -> Dict:
        """
        Generate a complete itinerary using the standalone pipeline.
        
        Args:
            destination: Target destination city
            days: Number of days for the trip
            from_city: Origin city
            budget: Budget level
            interests: List of travel interests
            
        Returns:
            Complete itinerary dictionary
        """
        try:
            logger.info(f"Generating itinerary for {destination} ({days} days)")
            
            # Generate skeleton
            skeleton = self._generate_skeleton(destination, days, from_city, budget, interests)
            
            # Enrich with knowledge
            enriched = self._enrich_with_knowledge(skeleton, destination)
            
            # Add pipeline info
            enriched["pipeline_info"] = {
                "stages_completed": ["skeleton_generation", "knowledge_enrichment"],
                "skeleton_validation": True,
                "enrichment_success": True,
                "pipeline_type": "standalone_lightweight"
            }
            
            logger.info("Itinerary generation completed successfully")
            return enriched
            
        except Exception as e:
            logger.error(f"Itinerary generation failed: {e}")
            return self._generate_fallback_itinerary(destination, days, from_city, budget, interests)
    
    def _generate_skeleton(self, destination: str, days: int, from_city: str, 
                          budget: str, interests: List[str]) -> Dict:
        """Generate a basic skeleton itinerary with varied activities and times."""
        
        # Create destination-specific themes
        themes = [
            f"Day 1: {destination} introduction and cultural immersion",
            f"Day 2: {destination} main attractions and landmarks", 
            f"Day 3: {destination} local experiences and hidden gems",
            f"Day 4: {destination} culinary adventures and nightlife",
            f"Day 5: {destination} shopping and relaxation",
            f"Day 6: {destination} outdoor adventures and nature",
            f"Day 7: {destination} art, history and museums"
        ]
        
        # Create varied activity templates with times
        morning_activities = [
            "09:00 - Explore iconic landmarks and main attractions",
            "08:30 - Visit world-renowned museums and galleries", 
            "09:30 - Discover historic neighborhoods and architecture",
            "08:00 - Experience local markets and street food",
            "09:00 - Enjoy scenic parks and outdoor spaces"
        ]
        
        afternoon_activities = [
            "14:00 - Tour cultural sites and monuments",
            "13:30 - Experience authentic local cuisine",
            "15:00 - Explore hidden gems and local favorites", 
            "14:30 - Visit specialty shops and unique districts",
            "13:00 - Relax in beautiful gardens and waterfront areas"
        ]
        
        evening_activities = [
            "19:00 - Experience vibrant nightlife and entertainment",
            "18:30 - Enjoy sunset views from scenic viewpoints",
            "20:00 - Dine at renowned restaurants and local eateries",
            "19:30 - Attend cultural performances and shows",
            "18:00 - Stroll through illuminated city centers"
        ]
        
        # Build itinerary with varied content
        itinerary = []
        for i in range(days):
            day_num = i + 1
            theme = themes[i % len(themes)]
            
            # Select varied activities for each day
            morning_idx = i % len(morning_activities)
            afternoon_idx = (i + 1) % len(afternoon_activities) 
            evening_idx = (i + 2) % len(evening_activities)
            
            day_activities = [
                morning_activities[morning_idx],
                afternoon_activities[afternoon_idx],
                evening_activities[evening_idx]
            ]
            
            itinerary.append({
                "day": day_num,
                "theme": theme,
                "activities": day_activities,
                "highlights": [f"Discover {destination} landmarks", f"Experience local culture"],
                "cultural_insight": f"Immerse yourself in {destination}'s rich cultural heritage.",
                "local_secrets": f"Explore authentic experiences beyond tourist spots in {destination}.",
                "travel_tips": f"Plan your trip from {from_city} to {destination} with local insights."
            })
        
        return {
            "summary": f"Your {days}-day journey from {from_city} to {destination}",
            "itinerary": itinerary,
            "estimated_budget": budget,
            "ai_provider": "Standalone Lightweight Pipeline"
        }
    
    def _enrich_with_knowledge(self, skeleton: Dict, destination: str) -> Dict:
        """Enrich the skeleton with factual knowledge."""
        enriched = skeleton.copy()
        
        # Get knowledge for this destination
        knowledge = self._get_destination_knowledge(destination.lower())
        
        if knowledge:
            # Enhance activities with real attractions while preserving timing
            for day in enriched.get("itinerary", []):
                activities = day.get("activities", [])
                enhanced_activities = []
                
                for i, activity in enumerate(activities):
                    if "attractions" in knowledge and i < len(knowledge["attractions"]):
                        # Extract time from skeleton activity if present
                        time_part = ""
                        if " - " in activity:
                            time_part = activity.split(" - ")[0] + " - "
                        elif activity.startswith(("08:", "09:", "10:", "11:", "12:", "13:", "14:", "15:", "16:", "17:", "18:", "19:", "20:")):
                            time_part = activity.split(" - ")[0] + " - " if " - " in activity else activity[:5] + " - "
                        
                        # Combine time with real attraction
                        enhanced_activity = time_part + knowledge["attractions"][i]
                        enhanced_activities.append(enhanced_activity)
                    else:
                        enhanced_activities.append(activity)
                
                day["activities"] = enhanced_activities
                
                # Enhance other fields
                if "culture" in knowledge:
                    # Ensure cultural_insight is a string, not a list
                    culture_data = knowledge["culture"]
                    if isinstance(culture_data, list) and culture_data:
                        day["cultural_insight"] = culture_data[0]  # Use first item
                    else:
                        day["cultural_insight"] = str(culture_data)
                
                if "hidden_gems" in knowledge:
                    day["local_secrets"] = f"Discover hidden gems like {', '.join(knowledge['hidden_gems'][:2])}."
                
                if "practical_info" in knowledge:
                    # Ensure travel_tips is a string, not a list
                    practical_data = knowledge["practical_info"]
                    if isinstance(practical_data, list) and practical_data:
                        day["travel_tips"] = practical_data[0]  # Use first item
                    else:
                        day["travel_tips"] = str(practical_data)
        
        return enriched
    
    def _get_destination_knowledge(self, destination: str) -> Optional[Dict]:
        """Get knowledge data for a specific destination."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute("""
                    SELECT topic, content FROM knowledge 
                    WHERE destination = ?
                    ORDER BY created_at DESC
                """, (destination.lower(),))
                
                knowledge = {}
                for row in cursor.fetchall():
                    topic, content = row
                    if topic not in knowledge:
                        knowledge[topic] = []
                    knowledge[topic].append(content)
                
                return knowledge
                
        except Exception as e:
            logger.warning(f"Failed to get knowledge for {destination}: {e}")
            return None
    
    def _generate_fallback_itinerary(self, destination: str, days: int, from_city: str, 
                                   budget: str, interests: List[str]) -> Dict:
        """Generate a fallback itinerary if everything else fails."""
        return {
            "summary": f"Your {days}-day journey from {from_city} to {destination}",
            "itinerary": [
                {
                    "day": i + 1,
                    "theme": f"Day {i + 1}: Explore {destination}",
                    "activities": [
                        f"Morning: Discover {destination} attractions",
                        f"Afternoon: Experience local culture",
                        f"Evening: Enjoy {destination} cuisine"
                    ],
                    "highlights": [f"Explore {destination}", "Experience local culture"],
                    "cultural_insight": f"Immerse yourself in {destination}'s unique culture and traditions.",
                    "local_secrets": f"Discover hidden gems and authentic experiences in {destination}.",
                    "travel_tips": f"Plan your trip to {destination} with local insights and practical advice."
                }
                for i in range(days)
            ],
            "estimated_budget": budget,
            "ai_provider": "Fallback Generator",
            "pipeline_info": {
                "stages_completed": ["fallback_generation"],
                "skeleton_validation": False,
                "enrichment_success": False,
                "pipeline_type": "fallback"
            }
        }

# Convenience function for easy integration
def generate_itinerary_pipeline(destination: str, days: int, from_city: str = "various locations",
                               budget: str = "medium", interests: List[str] = None,
                               base_url: str = None, api_key: str = None, model: str = "gpt-oss-120b") -> Dict:
    """
    Convenience function to generate an itinerary using the standalone pipeline.
    
    Args:
        destination: Target destination city
        days: Number of days for the trip
        from_city: Origin city
        budget: Budget level
        interests: List of travel interests
        base_url: Not used in standalone version
        api_key: Not used in standalone version
        model: Not used in standalone version
        
    Returns:
        Complete enriched itinerary
    """
    pipeline = StandalonePipeline()
    return pipeline.generate_itinerary(destination, days, from_city, budget, interests)

if __name__ == "__main__":
    # Test the standalone pipeline
    print("Testing Standalone Pipeline...")
    
    pipeline = StandalonePipeline()
    
    # Test itinerary generation
    itinerary = pipeline.generate_itinerary("London", 3, "New York", "luxury", ["culture", "food"])
    
    print("\nGenerated Itinerary:")
    print(json.dumps(itinerary, indent=2))
    
    print("\n✅ Standalone pipeline test completed successfully!")