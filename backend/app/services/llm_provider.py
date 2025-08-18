"""
LLM Provider Service for NomadAI
Supports Together.ai as default and NVIDIA NIM as fallback.
"""

import os
from typing import List, Dict, Optional, Any
import logging

try:
    import httpx
except ImportError:
    httpx = None

logger = logging.getLogger(__name__)

class LLMProvider:
    """Universal LLM provider supporting Together.ai and NVIDIA NIM"""
    
    def __init__(self):
        # Together.ai Configuration (Default)
        self.together_api_key = os.getenv("TOGETHER_API_KEY", "")
        self.together_base_url = "https://api.together.xyz/v1/chat/completions"
        self.together_model = "mistralai/Mixtral-8x7B-Instruct-v0.1"
        
        # NVIDIA NIM Configuration (Fallback)
        self.nvidia_api_key = os.getenv("NVIDIA_API_KEY", "")
        self.nvidia_base_url = "https://api.nvcf.nvidia.com/v1/chat/completions"
        self.nvidia_model = "nvidia/gpt-oss-120b"
        
        # Provider priority: Together.ai first, then NVIDIA NIM
        self.providers = self._get_available_providers()
        
    def _get_available_providers(self) -> List[str]:
        """Get list of available providers in priority order"""
        providers = []
        
        if self.together_api_key:
            providers.append("together")
            logger.info("Together.ai provider available")
        
        if self.nvidia_api_key:
            providers.append("nvidia")
            logger.info("NVIDIA NIM provider available")
            
        if not providers:
            providers.append("fallback")
            logger.warning("No API keys configured, using fallback mode")
            
        return providers
    
    def is_configured(self) -> bool:
        """Check if at least one provider is configured"""
        return bool(self.together_api_key or self.nvidia_api_key)
    
    async def generate_completion(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """
        Generate completion using the first available provider.
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            **kwargs: Additional parameters like temperature, max_tokens
            
        Returns:
            Generated text response
        """
        for provider in self.providers:
            try:
                if provider == "together":
                    return await self._call_together(messages, **kwargs)
                elif provider == "nvidia":
                    return await self._call_nvidia(messages, **kwargs)
                elif provider == "fallback":
                    return self._fallback_response(messages)
            except Exception as e:
                logger.warning(f"{provider} provider failed: {e}")
                continue
        
        # If all providers fail, use fallback
        return self._fallback_response(messages)
    
    async def _call_together(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """Call Together.ai API"""
        if httpx is None:
            raise Exception("httpx not available")
            
        headers = {
            "Authorization": f"Bearer {self.together_api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.together_model,
            "messages": messages,
            "temperature": kwargs.get("temperature", 0.7),
            "max_tokens": kwargs.get("max_tokens", 2048),
            "stream": False
        }
        
        async with httpx.AsyncClient(timeout=120) as client:
            response = await client.post(self.together_base_url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"].strip()
    
    async def _call_nvidia(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """Call NVIDIA NIM API"""
        if httpx is None:
            raise Exception("httpx not available")
            
        headers = {
            "Authorization": f"Bearer {self.nvidia_api_key}",
            "Content-Type": "application/json",
            "User-Agent": "NomadAI-Travel-Platform/2.2.0"
        }
        
        payload = {
            "model": self.nvidia_model,
            "messages": messages,
            "temperature": kwargs.get("temperature", 0.7),
            "max_tokens": kwargs.get("max_tokens", 2048),
            "stream": False
        }
        
        async with httpx.AsyncClient(timeout=120) as client:
            response = await client.post(self.nvidia_base_url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"].strip()
    
    def _fallback_response(self, messages: List[Dict[str, str]]) -> str:
        """Generate a basic response when no providers are available"""
        user_message = messages[-1]["content"] if messages else ""
        
        return """I'm NomadAI, your travel planning assistant. I can help you create personalized itineraries for any destination. 

To get started, please tell me:
- Where would you like to travel?
- How many days will you be there?
- What are your interests (culture, food, history, adventure, etc.)?
- What's your budget preference?

I'll create a detailed, day-by-day itinerary tailored specifically to your preferences and travel style."""
    
    def get_provider_info(self) -> Dict[str, Any]:
        """Get information about configured providers"""
        info = {
            "configured_providers": self.providers,
            "default_provider": self.providers[0] if self.providers else "none"
        }
        
        if "together" in self.providers:
            info["together"] = {
                "name": "Together.ai",
                "model": self.together_model,
                "status": "active"
            }
        
        if "nvidia" in self.providers:
            info["nvidia"] = {
                "name": "NVIDIA NIM",
                "model": self.nvidia_model,
                "status": "active"
            }
        
        return info

# Global provider instance
_provider = None

def get_llm_provider() -> LLMProvider:
    """Get the global LLM provider instance"""
    global _provider
    if _provider is None:
        _provider = LLMProvider()
    return _provider

def is_configured() -> bool:
    """Check if LLM provider is configured"""
    return get_llm_provider().is_configured()

async def generate_completion(messages: List[Dict[str, str]], **kwargs) -> str:
    """Generate completion using the configured provider"""
    provider = get_llm_provider()
    return await provider.generate_completion(messages, **kwargs)

def get_ai_provider_info() -> Dict[str, Any]:
    """Get AI provider information"""
    return get_llm_provider().get_provider_info()