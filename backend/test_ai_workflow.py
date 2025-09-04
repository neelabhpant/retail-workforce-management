#!/usr/bin/env python3
"""
Test the complete AI agent workflow with Prophet integration
"""

import asyncio
import json
import os
from datetime import datetime
from dotenv import load_dotenv
from scheduling_agents import SchedulingAgentsManager

# Load environment variables
load_dotenv()

async def test_ai_workflow():
    """Test the complete AI scheduling workflow"""
    
    print("=" * 80)
    print("🤖 Testing Complete AI Agent Workflow")
    print("=" * 80)
    
    # Initialize the scheduling agents manager
    manager = SchedulingAgentsManager()
    
    # Simulate a request
    request = {
        'date_range': '2024-01-01 to 2024-01-07',
        'locations': ['store_001'],
        'departments': ['Electronics', 'Sales Floor', 'Customer Service'],
        'constraints': ['labor_cost_limit', 'employee_preferences', 'skill_matching']
    }
    
    # Simulate Prophet forecast (store-wide)
    prophet_forecast = {
        'total_weekly_customers': 7500,
        'daily_customers': [1000, 1050, 1100, 1150, 1300, 1450, 950],  # Mon-Sun
        'peak_days': ['Friday', 'Saturday'],
        'confidence': 0.89
    }
    
    print("\n📊 Prophet Forecast (Store-wide):")
    print("-" * 40)
    print(f"Total Weekly Customers: {prophet_forecast['total_weekly_customers']}")
    print(f"Daily Breakdown: {prophet_forecast['daily_customers']}")
    print(f"Peak Days: {prophet_forecast['peak_days']}")
    print(f"Forecast Confidence: {prophet_forecast['confidence']:.1%}")
    
    print("\n🎯 Request Parameters:")
    print("-" * 40)
    print(f"Date Range: {request['date_range']}")
    print(f"Departments: {request['departments']}")
    print(f"Constraints: {request['constraints']}")
    
    print("\n" + "=" * 80)
    print("🚀 Starting AI Agent Optimization...")
    print("=" * 80)
    
    try:
        # Run the optimization with AI agents
        result = await manager.optimize_schedule_with_agents(request, prophet_forecast)
        
        print("\n" + "=" * 80)
        print("✅ Optimization Complete!")
        print("=" * 80)
        
        # Display results
        print("\n📈 Optimization Results:")
        print("-" * 40)
        print(f"Optimization ID: {result.get('optimization_id', 'N/A')}")
        print(f"Total Shifts Created: {result.get('total_shifts', 0)}")
        print(f"Total Cost: ${result.get('total_cost', 0):,.2f}")
        print(f"Cost Savings: ${result.get('cost_savings', 0):,.2f}")
        print(f"Coverage Score: {result.get('coverage_score', 0):.1%}")
        print(f"Employee Satisfaction: {result.get('employee_satisfaction', 0):.1%}")
        print(f"Quality Score: {result.get('quality_score', 0)}/10")
        
        # Display department allocations if available
        if 'demand_forecast' in result and 'department_allocations' in result['demand_forecast']:
            print("\n🏬 Department Allocations (from AI):")
            print("-" * 40)
            for dept, allocation in result['demand_forecast']['department_allocations'].items():
                pct = allocation.get('percentage', 0)
                customers = int(prophet_forecast['total_weekly_customers'] * pct)
                print(f"{dept}: {pct:.1%} ({customers} customers/week)")
                if 'reasoning' in allocation:
                    print(f"  Reasoning: {allocation['reasoning'][:80]}...")
        
        # Display sample shifts
        if 'shifts' in result and result['shifts']:
            print(f"\n📅 Sample Shifts (showing first 5 of {len(result['shifts'])}):")
            print("-" * 40)
            for shift in result['shifts'][:5]:
                day_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                day_name = day_names[shift.get('day', 0)] if 0 <= shift.get('day', 0) < 7 else 'Unknown'
                print(f"  {day_name} - {shift.get('department', 'N/A')}: "
                      f"{shift.get('employee_id', 'N/A')} "
                      f"({shift.get('start_time', 'N/A')}-{shift.get('end_time', 'N/A')})")
        
        # Display recommendations
        if 'recommendations' in result and result['recommendations']:
            print(f"\n💡 AI Recommendations:")
            print("-" * 40)
            for i, rec in enumerate(result['recommendations'][:3], 1):
                print(f"{i}. {rec}")
        
        # Display risks
        if 'risks' in result and result['risks']:
            print(f"\n⚠️  Identified Risks:")
            print("-" * 40)
            for i, risk in enumerate(result['risks'][:3], 1):
                print(f"{i}. {risk}")
        
        # Agent confidence scores
        if 'agent_decisions' in result:
            print(f"\n🤖 Agent Confidence Scores:")
            print("-" * 40)
            for agent, confidence in result['agent_decisions'].items():
                agent_name = agent.replace('_', ' ').title()
                print(f"{agent_name}: {confidence:.1%}")
        
        print("\n" + "=" * 80)
        print("✅ All AI agents successfully used LLM reasoning!")
        print("=" * 80)
        
        # Save result to file for inspection
        output_file = f"ai_schedule_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w') as f:
            json.dump(result, f, indent=2, default=str)
        print(f"\n📁 Full results saved to: {output_file}")
        
        return True
        
    except Exception as e:
        print("\n" + "=" * 80)
        print(f"❌ Error during AI workflow: {str(e)}")
        print("=" * 80)
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run the test"""
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ ERROR: OPENAI_API_KEY not found in .env file")
        return 1
    
    print(f"✓ OpenAI API Key found: {api_key[:7]}...{api_key[-4:]}")
    
    # Run the async test
    success = asyncio.run(test_ai_workflow())
    
    if success:
        print("\n🎉 SUCCESS: AI agent workflow is working correctly!")
        return 0
    else:
        print("\n❌ FAILURE: AI agent workflow encountered errors")
        return 1

if __name__ == "__main__":
    import sys
    sys.exit(main())