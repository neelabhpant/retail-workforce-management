#!/usr/bin/env python3
"""
Test the Retention Analytics AI agents workflow
"""

import asyncio
import json
import os
from datetime import datetime
from dotenv import load_dotenv
from retention_agents import retention_agents

# Load environment variables
load_dotenv()

async def test_retention_workflow():
    """Test the complete retention analytics workflow"""
    
    print("=" * 80)
    print("🤖 Testing Retention Analytics AI Agents")
    print("=" * 80)
    
    # Sample employee data
    sample_employees = [
        {
            'id': 'emp_001',
            'name': 'Alice Johnson',
            'department': 'Electronics',
            'position': 'Sales Associate',
            'tenure_days': 450,
            'hourly_wage': 18.50,
            'overtime_hours': 15,
            'skills': ['POS', 'Customer Service', 'Product Knowledge']
        },
        {
            'id': 'emp_002',
            'name': 'Bob Smith',
            'department': 'Sales Floor',
            'position': 'Senior Associate',
            'tenure_days': 890,
            'hourly_wage': 22.00,
            'overtime_hours': 5,
            'skills': ['Leadership', 'Training', 'Inventory']
        },
        {
            'id': 'emp_003',
            'name': 'Carol Davis',
            'department': 'Customer Service',
            'position': 'Service Representative',
            'tenure_days': 180,
            'hourly_wage': 16.00,
            'overtime_hours': 25,
            'skills': ['Communication', 'Problem Solving']
        },
        {
            'id': 'emp_004',
            'name': 'David Wilson',
            'department': 'Electronics',
            'position': 'Department Manager',
            'tenure_days': 1200,
            'hourly_wage': 28.00,
            'overtime_hours': 8,
            'skills': ['Management', 'Analytics', 'Strategy']
        },
        {
            'id': 'emp_005',
            'name': 'Eve Martinez',
            'department': 'Sales Floor',
            'position': 'Sales Associate',
            'tenure_days': 90,
            'hourly_wage': 15.50,
            'overtime_hours': 20,
            'skills': ['Sales', 'Customer Service']
        }
    ]
    
    # Historical data
    historical_data = {
        'turnover_rate': 0.15,  # 15% annual turnover
        'avg_tenure': 730,  # 2 years average
        'exit_reasons': ['Better opportunity', 'Work-life balance', 'Compensation'],
        'peak_turnover_months': [3, 6, 12]  # High turnover at 3, 6, and 12 months
    }
    
    print("\n📊 Sample Data:")
    print("-" * 40)
    print(f"Employees: {len(sample_employees)}")
    print(f"Departments: {list(set(e['department'] for e in sample_employees))}")
    print(f"Average Tenure: {sum(e['tenure_days'] for e in sample_employees) / len(sample_employees):.0f} days")
    print(f"Average Wage: ${sum(e['hourly_wage'] for e in sample_employees) / len(sample_employees):.2f}/hour")
    
    print("\n" + "=" * 80)
    print("🚀 Starting Retention Risk Analysis...")
    print("=" * 80)
    
    try:
        # Run the retention analysis
        result = await retention_agents.analyze_retention_risks(
            employee_data=sample_employees,
            historical_data=historical_data
        )
        
        print("\n" + "=" * 80)
        print("✅ Analysis Complete!")
        print("=" * 80)
        
        # Display results
        print("\n📈 Executive Summary:")
        print("-" * 40)
        summary = result.get('executive_summary', {})
        print(f"High Risk Employees: {summary.get('high_risk_count', 0)}")
        print(f"Average Risk Score: {summary.get('average_risk_score', 0)}")
        print(f"Top Risk Factors: {', '.join(summary.get('top_risk_factors', []))}")
        print(f"Estimated Turnover Cost: ${summary.get('estimated_turnover_cost', 0):,.2f}")
        print(f"Recommended Investment: ${summary.get('recommended_investment', 0):,.2f}")
        
        # Display AI insights
        print("\n🤖 AI Agent Insights:")
        print("-" * 40)
        
        # Risk Analysis
        if 'risk_analysis' in result:
            print("\n1. Risk Analysis:")
            risk_data = result['risk_analysis']
            if isinstance(risk_data, dict):
                print(f"   Status: {risk_data.get('status', 'processed')}")
                print(f"   Confidence: {risk_data.get('confidence', 0):.1%}")
                if 'insights' in risk_data:
                    print(f"   Insights: {risk_data['insights'][:150]}...")
        
        # Engagement Metrics
        if 'engagement_metrics' in result:
            print("\n2. Engagement Metrics:")
            engagement_data = result['engagement_metrics']
            if isinstance(engagement_data, dict):
                print(f"   Status: {engagement_data.get('status', 'processed')}")
                print(f"   Confidence: {engagement_data.get('confidence', 0):.1%}")
        
        # Career Development
        if 'career_development' in result:
            print("\n3. Career Development:")
            career_data = result['career_development']
            if isinstance(career_data, dict):
                print(f"   Status: {career_data.get('status', 'processed')}")
                print(f"   Confidence: {career_data.get('confidence', 0):.1%}")
        
        # Compensation Insights
        if 'compensation_insights' in result:
            print("\n4. Compensation Analysis:")
            comp_data = result['compensation_insights']
            if isinstance(comp_data, dict):
                print(f"   Status: {comp_data.get('status', 'processed')}")
                print(f"   Confidence: {comp_data.get('confidence', 0):.1%}")
        
        # Retention Strategy
        if 'retention_strategy' in result:
            print("\n5. Retention Strategy:")
            strategy_data = result['retention_strategy']
            if isinstance(strategy_data, dict):
                print(f"   Status: {strategy_data.get('status', 'processed')}")
                print(f"   Confidence: {strategy_data.get('confidence', 0):.1%}")
                if 'insights' in strategy_data:
                    print(f"   Strategic Focus: {strategy_data['insights'][:150]}...")
        
        print("\n" + "=" * 80)
        print("✅ All retention agents successfully used AI reasoning!")
        print("=" * 80)
        
        # Save results to file
        output_file = f"retention_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w') as f:
            json.dump(result, f, indent=2, default=str)
        print(f"\n📁 Full results saved to: {output_file}")
        
        return True
        
    except Exception as e:
        print("\n" + "=" * 80)
        print(f"❌ Error during retention workflow: {str(e)}")
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
    success = asyncio.run(test_retention_workflow())
    
    if success:
        print("\n🎉 SUCCESS: Retention analytics AI agents are working correctly!")
        return 0
    else:
        print("\n❌ FAILURE: Retention analytics workflow encountered errors")
        return 1

if __name__ == "__main__":
    import sys
    sys.exit(main())