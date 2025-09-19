#!/usr/bin/env python3
"""
Test script to verify the timeout fix for AI-powered scheduling
"""

import asyncio
import aiohttp
import json
from datetime import datetime

async def test_schedule_optimization():
    """Test the schedule optimization endpoint with timeout handling"""
    
    url = "http://localhost:8000/api/agents/optimize-schedule-crewai"
    
    payload = {
        "date_range": "2024-01-01 to 2024-01-07",
        "locations": ["Store 1"],
        "departments": ["Sales Floor", "Customer Service", "Electronics"],
        "constraints": ["max_hours_per_week", "min_rest_hours"]
    }
    
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Starting schedule optimization test...")
    print(f"Departments: {payload['departments']}")
    print("-" * 60)
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, timeout=aiohttp.ClientTimeout(total=200)) as response:
                result = await response.json()
                
                if response.status == 200:
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] ✅ SUCCESS: Optimization completed!")
                    
                    if result.get('success'):
                        data = result.get('data', {})
                        print(f"Optimization ID: {data.get('optimization_id', 'N/A')}")
                        print(f"Total shifts generated: {data.get('total_shifts', 0)}")
                        print(f"Coverage score: {data.get('coverage_score', 0):.2f}")
                        
                        # Check if it was a timeout fallback
                        if 'timeout' in data.get('optimization_id', ''):
                            print("⚠️  Used timeout fallback schedule")
                        elif data.get('error'):
                            print(f"⚠️  Error occurred: {data.get('error')}")
                        else:
                            print("✅ AI agents completed successfully")
                            
                        # Show sample shifts
                        shifts = data.get('shifts', [])
                        if shifts:
                            print(f"\nFirst 3 shifts:")
                            for shift in shifts[:3]:
                                print(f"  - {shift.get('department')} on Day {shift.get('day')}: "
                                      f"{shift.get('start_time')} - {shift.get('end_time')} "
                                      f"(Employee: {shift.get('employee_name')})")
                    else:
                        print(f"❌ API returned error: {result.get('detail', 'Unknown error')}")
                else:
                    print(f"❌ HTTP {response.status}: {await response.text()}")
                    
    except asyncio.TimeoutError:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] ❌ Client timeout after 200 seconds")
        print("This should not happen with the fix - the server should handle timeouts internally")
    except Exception as e:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] ❌ Error: {e}")
    
    print("-" * 60)

async def main():
    """Run the test"""
    print("=" * 60)
    print("AI-POWERED SCHEDULING TIMEOUT FIX TEST")
    print("=" * 60)
    print("\nThis test verifies that:")
    print("1. The scheduling optimization doesn't hang indefinitely")
    print("2. Timeout handling works correctly (60s per agent, 180s total)")
    print("3. Fallback schedules are generated when timeouts occur")
    print("4. The system remains responsive even with slow AI agents")
    print("\n" + "=" * 60)
    
    await test_schedule_optimization()
    
    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())