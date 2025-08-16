"""
Premium Features Service
Handles subscription tiers, feature gating, and premium AI capabilities
"""

from enum import Enum
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from pydantic import BaseModel
import json


class SubscriptionTier(Enum):
    FREE = "free"
    PREMIUM = "premium"
    ENTERPRISE = "enterprise"


class UserSubscription(BaseModel):
    user_id: str
    tier: SubscriptionTier
    expires_at: Optional[datetime] = None
    features_used_this_month: Dict[str, int] = {}
    created_at: datetime = datetime.now()


class FeatureLimits(BaseModel):
    itinerary_generations: int
    chat_messages: int
    real_time_updates: bool
    memory_retention_days: int
    advanced_tools: bool
    api_calls_per_day: int
    premium_support: bool


class PremiumFeatureService:
    def __init__(self):
        # In production, this would be a database
        self.subscriptions: Dict[str, UserSubscription] = {}
        self.feature_limits = {
            SubscriptionTier.FREE: FeatureLimits(
                itinerary_generations=3,
                chat_messages=50,
                real_time_updates=False,
                memory_retention_days=7,
                advanced_tools=False,
                api_calls_per_day=100,
                premium_support=False
            ),
            SubscriptionTier.PREMIUM: FeatureLimits(
                itinerary_generations=50,
                chat_messages=1000,
                real_time_updates=True,
                memory_retention_days=365,
                advanced_tools=True,
                api_calls_per_day=1000,
                premium_support=True
            ),
            SubscriptionTier.ENTERPRISE: FeatureLimits(
                itinerary_generations=-1,  # Unlimited
                chat_messages=-1,
                real_time_updates=True,
                memory_retention_days=-1,
                advanced_tools=True,
                api_calls_per_day=10000,
                premium_support=True
            )
        }
    
    def get_user_subscription(self, user_id: str) -> UserSubscription:
        """Get user subscription, defaulting to free tier"""
        if user_id not in self.subscriptions:
            self.subscriptions[user_id] = UserSubscription(
                user_id=user_id,
                tier=SubscriptionTier.FREE
            )
        return self.subscriptions[user_id]
    
    def upgrade_subscription(self, user_id: str, tier: SubscriptionTier, duration_days: int = 30) -> bool:
        """Upgrade user subscription"""
        subscription = self.get_user_subscription(user_id)
        subscription.tier = tier
        subscription.expires_at = datetime.now() + timedelta(days=duration_days)
        subscription.features_used_this_month = {}  # Reset usage
        return True
    
    def check_feature_access(self, user_id: str, feature: str) -> Dict[str, Any]:
        """Check if user has access to a feature and usage limits"""
        subscription = self.get_user_subscription(user_id)
        limits = self.feature_limits[subscription.tier]
        
        # Check if subscription is expired
        if subscription.expires_at and subscription.expires_at < datetime.now():
            subscription.tier = SubscriptionTier.FREE
            subscription.expires_at = None
        
        current_month = datetime.now().strftime("%Y-%m")
        usage_key = f"{feature}_{current_month}"
        current_usage = subscription.features_used_this_month.get(usage_key, 0)
        
        # Get feature limit
        feature_limit = getattr(limits, feature, 0)
        
        return {
            "has_access": feature_limit == -1 or current_usage < feature_limit,
            "current_usage": current_usage,
            "limit": feature_limit,
            "tier": subscription.tier.value,
            "upgrade_required": feature_limit != -1 and current_usage >= feature_limit
        }
    
    def increment_feature_usage(self, user_id: str, feature: str, count: int = 1) -> bool:
        """Increment feature usage counter"""
        subscription = self.get_user_subscription(user_id)
        current_month = datetime.now().strftime("%Y-%m")
        usage_key = f"{feature}_{current_month}"
        
        current_usage = subscription.features_used_this_month.get(usage_key, 0)
        subscription.features_used_this_month[usage_key] = current_usage + count
        
        return True
    
    def get_premium_features_for_tier(self, tier: SubscriptionTier) -> Dict[str, Any]:
        """Get all features available for a subscription tier"""
        limits = self.feature_limits[tier]
        return {
            "tier": tier.value,
            "features": {
                "itinerary_generations": {
                    "limit": limits.itinerary_generations,
                    "description": "AI-powered itinerary planning"
                },
                "chat_messages": {
                    "limit": limits.chat_messages,
                    "description": "Conversations with AI travel companion"
                },
                "real_time_updates": {
                    "enabled": limits.real_time_updates,
                    "description": "Live travel alerts and price monitoring"
                },
                "memory_retention_days": {
                    "days": limits.memory_retention_days,
                    "description": "How long AI remembers your preferences"
                },
                "advanced_tools": {
                    "enabled": limits.advanced_tools,
                    "description": "Budget optimization, AR features, voice chat"
                },
                "api_calls_per_day": {
                    "limit": limits.api_calls_per_day,
                    "description": "API requests for integrations"
                },
                "premium_support": {
                    "enabled": limits.premium_support,
                    "description": "Priority customer support"
                }
            }
        }
    
    def get_upgrade_recommendations(self, user_id: str) -> Dict[str, Any]:
        """Get personalized upgrade recommendations"""
        subscription = self.get_user_subscription(user_id)
        current_tier = subscription.tier
        
        if current_tier == SubscriptionTier.ENTERPRISE:
            return {"message": "You have the highest tier available"}
        
        next_tier = SubscriptionTier.PREMIUM if current_tier == SubscriptionTier.FREE else SubscriptionTier.ENTERPRISE
        current_features = self.get_premium_features_for_tier(current_tier)
        next_features = self.get_premium_features_for_tier(next_tier)
        
        # Calculate usage patterns
        usage_stats = {}
        current_month = datetime.now().strftime("%Y-%m")
        for feature, usage in subscription.features_used_this_month.items():
            if current_month in feature:
                feature_name = feature.replace(f"_{current_month}", "")
                usage_stats[feature_name] = usage
        
        return {
            "current_tier": current_tier.value,
            "recommended_tier": next_tier.value,
            "usage_stats": usage_stats,
            "current_features": current_features,
            "upgrade_features": next_features,
            "savings_potential": self._calculate_savings_potential(usage_stats),
            "upgrade_url": f"/upgrade?tier={next_tier.value}"
        }
    
    def _calculate_savings_potential(self, usage_stats: Dict[str, int]) -> Dict[str, Any]:
        """Calculate potential savings and benefits from upgrading"""
        # Mock calculation - in production, this would be more sophisticated
        potential_savings = 0
        efficiency_gains = 0
        
        if usage_stats.get("itinerary_generations", 0) > 10:
            potential_savings += 50  # Estimated savings on booking
            efficiency_gains += 20  # Time saved
        
        if usage_stats.get("chat_messages", 0) > 100:
            efficiency_gains += 30
        
        return {
            "estimated_monthly_savings": potential_savings,
            "time_efficiency_percentage": efficiency_gains,
            "roi_months": 2 if potential_savings > 19 else 6
        }


# Global service instance
premium_service = PremiumFeatureService()