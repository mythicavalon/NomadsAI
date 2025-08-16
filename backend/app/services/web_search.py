from __future__ import annotations
import datetime as dt
from typing import List, Dict
from duckduckgo_search import DDGS


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