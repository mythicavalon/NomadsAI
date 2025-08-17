"""
Data ingestion module for loading external travel data sources.
"""

import json
import logging
import requests
from typing import Dict, List, Optional
from pathlib import Path
from .data_retriever import DataRetriever

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DataIngester:
    """Ingests external travel data sources into the knowledge base."""
    
    def __init__(self, retriever: DataRetriever):
        """Initialize with a data retriever instance."""
        self.retriever = retriever
        self.data_dir = Path("data/external")
        self.data_dir.mkdir(parents=True, exist_ok=True)
    
    def ingest_wikivoyage_data(self, destination: str) -> bool:
        """
        Ingest Wikivoyage data for a destination.
        
        Args:
            destination: Target destination city
            
        Returns:
            True if successful, False otherwise
        """
        try:
            logger.info(f"Ingesting Wikivoyage data for {destination}")
            
            # For now, we'll use a simplified approach with curated data
            # In production, you'd integrate with actual Wikivoyage API or dumps
            
            wikivoyage_data = self._get_curated_wikivoyage_data(destination)
            if wikivoyage_data:
                self._process_wikivoyage_data(destination, wikivoyage_data)
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Failed to ingest Wikivoyage data for {destination}: {e}")
            return False
    
    def _get_curated_wikivoyage_data(self, destination: str) -> Optional[Dict]:
        """Get curated Wikivoyage-style data for a destination."""
        
        # This is a simplified version - in production you'd fetch from actual Wikivoyage
        curated_data = {
            "london": {
                "culture": "London is a global city with a rich cultural heritage spanning over 2,000 years. The city is home to world-class museums, theaters, and historical landmarks.",
                "attractions": [
                    "British Museum - One of the world's greatest museums of human history and culture",
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
    
    def _process_wikivoyage_data(self, destination: str, data: Dict):
        """Process and index Wikivoyage data."""
        
        # Index cultural insights
        if "culture" in data:
            self.retriever._index_knowledge(destination, "cultural_insight", data["culture"])
        
        # Index attractions as activities
        if "attractions" in data:
            for attraction in data["attractions"]:
                self.retriever._index_knowledge(destination, "activities", attraction)
        
        # Index hidden gems
        if "hidden_gems" in data:
            for gem in data["hidden_gems"]:
                self.retriever._index_knowledge(destination, "highlights", gem)
                self.retriever._index_knowledge(destination, "local_secrets", gem)
        
        # Index practical info
        if "practical_info" in data:
            self.retriever._index_knowledge(destination, "travel_tips", data["practical_info"])
    
    def ingest_blog_snippets(self, destination: str, snippets: List[str]) -> bool:
        """
        Ingest blog snippets for a destination.
        
        Args:
            destination: Target destination city
            snippets: List of blog snippet texts
            
        Returns:
            True if successful, False otherwise
        """
        try:
            logger.info(f"Ingesting {len(snippets)} blog snippets for {destination}")
            
            for snippet in snippets:
                if len(snippet.strip()) > 20:
                    # Determine the topic based on content keywords
                    topic = self._classify_snippet_topic(snippet)
                    self.retriever._index_knowledge(destination, topic, snippet)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to ingest blog snippets for {destination}: {e}")
            return False
    
    def _classify_snippet_topic(self, snippet: str) -> str:
        """Classify a snippet into a topic category."""
        snippet_lower = snippet.lower()
        
        # Simple keyword-based classification
        if any(word in snippet_lower for word in ["museum", "gallery", "theater", "concert", "festival"]):
            return "activities"
        elif any(word in snippet_lower for word in ["restaurant", "cafe", "food", "cuisine", "dining"]):
            return "activities"
        elif any(word in snippet_lower for word in ["hidden", "secret", "local", "authentic", "off-the-beaten"]):
            return "local_secrets"
        elif any(word in snippet_lower for word in ["culture", "tradition", "custom", "etiquette"]):
            return "cultural_insight"
        elif any(word in snippet_lower for word in ["transport", "metro", "bus", "train", "airport", "hotel", "budget"]):
            return "travel_tips"
        else:
            return "highlights"
    
    def ingest_tripadvisor_data(self, destination: str, reviews: List[Dict]) -> bool:
        """
        Ingest TripAdvisor review data for a destination.
        
        Args:
            destination: Target destination city
            reviews: List of review dictionaries
            
        Returns:
            True if successful, False otherwise
        """
        try:
            logger.info(f"Ingesting {len(reviews)} TripAdvisor reviews for {destination}")
            
            for review in reviews:
                if isinstance(review, dict):
                    content = review.get("text", "")
                    rating = review.get("rating", 0)
                    
                    # Only index high-quality reviews (rating 4+ and sufficient length)
                    if rating >= 4 and len(content.strip()) > 30:
                        topic = self._classify_snippet_topic(content)
                        self.retriever._index_knowledge(destination, topic, content)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to ingest TripAdvisor data for {destination}: {e}")
            return False
    
    def bulk_ingest_destinations(self, destinations: List[str]) -> Dict[str, bool]:
        """
        Bulk ingest data for multiple destinations.
        
        Args:
            destinations: List of destination cities
            
        Returns:
            Dictionary mapping destinations to success status
        """
        results = {}
        
        for destination in destinations:
            logger.info(f"Starting bulk ingest for {destination}")
            
            # Ingest Wikivoyage data
            wikivoyage_success = self.ingest_wikivoyage_data(destination)
            
            # Ingest other sources as they become available
            # For now, just mark as successful if Wikivoyage worked
            results[destination] = wikivoyage_success
            
            logger.info(f"Completed ingest for {destination}: {'SUCCESS' if wikivoyage_success else 'FAILED'}")
        
        return results

def ingest_destination_data(destination: str, retriever: DataRetriever) -> bool:
    """Convenience function to ingest data for a destination."""
    ingester = DataIngester(retriever)
    return ingester.ingest_wikivoyage_data(destination)

# Example usage
if __name__ == "__main__":
    # Test the data ingester
    retriever = DataRetriever()
    ingester = DataIngester(retriever)
    
    # Test ingesting data for London
    success = ingester.ingest_wikivoyage_data("london")
    print(f"London data ingestion: {'SUCCESS' if success else 'FAILED'}")
    
    # Test bulk ingestion
    destinations = ["london", "paris", "tokyo"]
    results = ingester.bulk_ingest_destinations(destinations)
    
    print("\nBulk ingestion results:")
    for dest, result in results.items():
        print(f"- {dest}: {'SUCCESS' if result else 'FAILED'}")