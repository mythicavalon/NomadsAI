#!/usr/bin/env python3
"""
Test script for the two-stage itinerary generation pipeline.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.pipeline import (
    build_skeleton, 
    validate_skeleton,
    enrich_skeleton,
    generate_itinerary_pipeline
)

def test_skeleton_builder():
    """Test Stage 1: Skeleton Builder"""
    print("🧪 Testing Stage 1: Skeleton Builder")
    print("=" * 50)
    
    try:
        # Test skeleton generation
        skeleton = build_skeleton("London", 3, "New York", "luxury", ["culture", "food"])
        
        if skeleton:
            print("✅ Skeleton generated successfully")
            print(f"   Summary: {skeleton.get('summary', 'N/A')}")
            print(f"   Days: {len(skeleton.get('itinerary', []))}")
            print(f"   AI Provider: {skeleton.get('ai_provider', 'N/A')}")
            
            # Test validation
            is_valid = validate_skeleton(skeleton)
            print(f"   Validation: {'PASSED' if is_valid else 'FAILED'}")
            
            return skeleton
        else:
            print("❌ Skeleton generation failed")
            return None
            
    except Exception as e:
        print(f"❌ Skeleton builder test failed: {e}")
        return None

def test_data_retriever(skeleton):
    """Test Stage 2: Data Retriever"""
    print("\n🧪 Testing Stage 2: Data Retriever")
    print("=" * 50)
    
    try:
        # Test enrichment
        enriched = enrich_skeleton(skeleton)
        
        if enriched:
            print("✅ Skeleton enriched successfully")
            print(f"   AI Provider: {enriched.get('ai_provider', 'N/A')}")
            
            # Check if enrichment added content
            first_day = enriched.get('itinerary', [{}])[0] if enriched.get('itinerary') else {}
            activities = first_day.get('activities', [])
            cultural_insight = first_day.get('cultural_insight', '')
            
            print(f"   First day activities: {len(activities)} items")
            print(f"   Cultural insight length: {len(cultural_insight)} chars")
            
            return enriched
        else:
            print("❌ Skeleton enrichment failed")
            return None
            
    except Exception as e:
        print(f"❌ Data retriever test failed: {e}")
        return None

def test_full_pipeline():
    """Test the complete pipeline end-to-end"""
    print("\n🧪 Testing Complete Pipeline")
    print("=" * 50)
    
    try:
        # Test end-to-end generation
        itinerary = generate_itinerary_pipeline("Paris", 2, "London", "medium", ["art", "food"])
        
        if itinerary:
            print("✅ Full pipeline completed successfully")
            print(f"   Summary: {itinerary.get('summary', 'N/A')}")
            print(f"   Days: {len(itinerary.get('itinerary', []))}")
            print(f"   AI Provider: {itinerary.get('ai_provider', 'N/A')}")
            
            # Check pipeline info
            pipeline_info = itinerary.get('pipeline_info', {})
            stages = pipeline_info.get('stages_completed', [])
            print(f"   Stages completed: {stages}")
            
            return itinerary
        else:
            print("❌ Full pipeline failed")
            return None
            
    except Exception as e:
        print(f"❌ Full pipeline test failed: {e}")
        return None

def main():
    """Run all pipeline tests"""
    print("🚀 Testing Two-Stage Itinerary Generation Pipeline")
    print("=" * 60)
    
    # Test Stage 1
    skeleton = test_skeleton_builder()
    if not skeleton:
        print("\n❌ Stage 1 failed, cannot continue with Stage 2")
        return False
    
    # Test Stage 2
    enriched = test_data_retriever(skeleton)
    if not enriched:
        print("\n❌ Stage 2 failed")
        return False
    
    # Test full pipeline
    full_result = test_full_pipeline()
    if not full_result:
        print("\n❌ Full pipeline failed")
        return False
    
    print("\n🎉 All pipeline tests passed successfully!")
    print("=" * 60)
    
    # Show sample output
    print("\n📋 Sample Pipeline Output:")
    print("-" * 30)
    
    first_day = full_result.get('itinerary', [{}])[0] if full_result.get('itinerary') else {}
    if first_day:
        print(f"Day {first_day.get('day', 'N/A')}: {first_day.get('theme', 'N/A')}")
        print(f"Activities: {len(first_day.get('activities', []))} items")
        print(f"Highlights: {len(first_day.get('highlights', []))} items")
        print(f"Cultural Insight: {first_day.get('cultural_insight', 'N/A')[:100]}...")
        print(f"Local Secrets: {first_day.get('local_secrets', 'N/A')[:100]}...")
        print(f"Travel Tips: {first_day.get('travel_tips', 'N/A')[:100]}...")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)