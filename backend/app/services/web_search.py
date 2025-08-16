from __future__ import annotations
import asyncio
import datetime as dt
from typing import List, Dict, Optional
from duckduckgo_search import DDGS
import json
import httpx


def search_text(query: str, max_results: int = 5) -> List[Dict]:
	items: List[Dict] = []
	with DDGS() as ddg:
		for r in ddg.text(query, max_results=max_results, safesearch="moderate"):  # type: ignore
			items.append({
				"title": r.get("title"),
				"href": r.get("href"),
				"snippet": r.get("body") or r.get("snippet") or "",
			})
	return items


def search_news(query: str, max_results: int = 5) -> List[Dict]:
	items: List[Dict] = []
	with DDGS() as ddg:
		for r in ddg.news(query, max_results=max_results, safesearch="moderate"):  # type: ignore
			pub = r.get("date") or r.get("published")
			items.append({
				"title": r.get("title"),
				"href": r.get("url") or r.get("link"),
				"source": r.get("source"),
				"snippet": r.get("body") or r.get("excerpt") or "",
				"date": pub,
			})
	return items


async def search_web(query: str, max_results: int = 5, search_type: str = "text") -> List[Dict]:
	"""Async web search with enhanced travel context"""
	def _search():
		if search_type == "news":
			return search_news(query, max_results)
		else:
			return search_text(query, max_results)
	
	# Run in thread pool to avoid blocking
	loop = asyncio.get_event_loop()
	return await loop.run_in_executor(None, _search)


async def search_travel_deals(destination: str, departure_city: Optional[str] = None) -> List[Dict]:
	"""Search for travel deals and flight prices"""
	queries = [
		f"cheap flights to {destination}",
		f"hotel deals {destination}",
		f"travel deals {destination}"
	]
	
	if departure_city:
		queries.append(f"flights from {departure_city} to {destination}")
	
	all_results = []
	for query in queries[:2]:  # Limit to prevent rate limiting
		results = await search_web(query, max_results=3)
		for result in results:
			result['search_type'] = 'deal'
		all_results.extend(results)
	
	return all_results[:5]  # Return top 5 combined results


async def search_local_events(destination: str, date_range: Optional[str] = None) -> List[Dict]:
	"""Search for local events and happenings"""
	query = f"events {destination}"
	if date_range:
		query += f" {date_range}"
	else:
		query += " this week"
	
	results = await search_web(query, max_results=5, search_type="news")
	for result in results:
		result['search_type'] = 'event'
	return results


async def search_weather_alerts(destination: str) -> List[Dict]:
	"""Search for weather alerts and travel warnings"""
	query = f"weather alerts travel warnings {destination}"
	results = await search_web(query, max_results=3, search_type="news")
	for result in results:
		result['search_type'] = 'alert'
	return results


async def comprehensive_travel_search(destination: str, departure_city: Optional[str] = None) -> Dict[str, List[Dict]]:
	"""Comprehensive travel search combining multiple sources"""
	
	# Run searches in parallel for better performance
	search_tasks = [
		search_travel_deals(destination, departure_city),
		search_local_events(destination),
		search_weather_alerts(destination)
	]
	
	try:
		deals, events, alerts = await asyncio.gather(*search_tasks, return_exceptions=True)
		
		# Handle exceptions gracefully
		deals = deals if not isinstance(deals, Exception) else []
		events = events if not isinstance(events, Exception) else []
		alerts = alerts if not isinstance(alerts, Exception) else []
		
		return {
			"deals": deals,
			"events": events,
			"alerts": alerts,
			"timestamp": dt.datetime.now().isoformat()
		}
	except Exception as e:
		return {
			"deals": [],
			"events": [],
			"alerts": [],
			"error": str(e),
			"timestamp": dt.datetime.now().isoformat()
		}