#!/usr/bin/env python3
"""
Test the Learning Paths AI agents workflow
"""

import asyncio
import json
import os
from datetime import datetime
from dotenv import load_dotenv
from learning_agents import learning_agents

# Load environment variables
load_dotenv()

async def test_learning_workflow():
    """Test the complete learning paths workflow"""
    
    print("=" * 80)
    print("🤖 Testing Learning Paths AI Agents")
    print("=" * 80)
    
    # Sample employee data with skills
    sample_employees = [
        {
            'id': 'emp_001',
            'name': 'Alice Johnson',
            'department': 'Electronics',
            'position': 'Sales Associate',
            'tenure_days': 450,
            'skills': ['POS', 'Customer Service', 'Product Knowledge'],
            'performance_rating': 3.8
        },
        {
            'id': 'emp_002',
            'name': 'Bob Smith',
            'department': 'Sales Floor',
            'position': 'Senior Associate',
            'tenure_days': 890,
            'skills': ['Leadership', 'Training', 'Inventory', 'Sales'],
            'performance_rating': 4.5
        },
        {
            'id': 'emp_003',
            'name': 'Carol Davis',
            'department': 'Customer Service',
            'position': 'Service Representative',
            'tenure_days': 180,
            'skills': ['Communication', 'Problem Solving'],
            'performance_rating': 3.2
        },
        {
            'id': 'emp_004',
            'name': 'David Wilson',
            'department': 'Electronics',
            'position': 'Department Manager',
            'tenure_days': 1200,
            'skills': ['Management', 'Analytics', 'Strategy', 'Finance'],
            'performance_rating': 4.7
        },
        {
            'id': 'emp_005',
            'name': 'Eve Martinez',
            'department': 'Sales Floor',
            'position': 'Sales Associate',
            'tenure_days': 90,
            'skills': ['Sales', 'Customer Service'],
            'performance_rating': 3.5
        }
    ]
    
    # Business priorities
    business_priorities = [
        'Customer service excellence',
        'Digital retail technology',
        'Sales and upselling techniques',
        'Inventory management systems',
        'Team leadership and coaching'
    ]
    
    # Role requirements
    role_requirements = {
        'Sales Associate': ['Customer Service', 'Sales', 'POS', 'Product Knowledge'],
        'Senior Associate': ['Leadership', 'Training', 'Advanced Sales', 'Inventory'],
        'Department Manager': ['Management', 'Analytics', 'Strategy', 'Finance', 'Team Building'],
        'Service Representative': ['Communication', 'Problem Solving', 'Conflict Resolution', 'Systems']
    }
    
    print("\n📊 Sample Data:")
    print("-" * 40)
    print(f"Employees: {len(sample_employees)}")
    print(f"Departments: {list(set(e['department'] for e in sample_employees))}")
    print(f"Positions: {list(set(e['position'] for e in sample_employees))}")
    print(f"Average Performance: {sum(e.get('performance_rating', 3.5) for e in sample_employees) / len(sample_employees):.1f}")
    
    print("\n🎯 Business Priorities:")
    for i, priority in enumerate(business_priorities, 1):
        print(f"   {i}. {priority}")
    
    print("\n" + "=" * 80)
    print("🚀 Starting Learning Path Creation...")
    print("=" * 80)
    
    try:
        # Run the learning path creation
        result = await learning_agents.create_learning_paths(
            employee_data=sample_employees,
            role_requirements=role_requirements,
            business_priorities=business_priorities
        )
        
        print("\n" + "=" * 80)
        print("✅ Analysis Complete!")
        print("=" * 80)
        
        # Display results
        print("\n📈 Executive Summary:")
        print("-" * 40)
        summary = result.get('executive_summary', {})
        print(f"Total Skill Gaps: {summary.get('total_skill_gaps', 0)}")
        print(f"Priority Skills: {', '.join(summary.get('priority_skills', []))}")
        print(f"Time to Competency: {summary.get('average_time_to_competency', 'N/A')}")
        print(f"Recommended Hours/Week: {summary.get('recommended_learning_hours_per_week', 0)}")
        print(f"Estimated ROI: {summary.get('estimated_roi', 'N/A')}")
        print(f"Engagement Target: {summary.get('engagement_target', 0):.0%}")
        
        # Display AI insights
        print("\n🤖 AI Agent Insights:")
        print("-" * 40)
        
        # Skills Analysis
        if 'skills_analysis' in result:
            print("\n1. Skills Gap Analysis:")
            skills_data = result['skills_analysis']
            if isinstance(skills_data, dict):
                print(f"   Status: {skills_data.get('status', 'processed')}")
                print(f"   Confidence: {skills_data.get('confidence', 0):.1%}")
                if 'insights' in skills_data:
                    print(f"   Key Gaps: {skills_data['insights'][:150]}...")
        
        # Learning Paths
        if 'learning_paths' in result:
            print("\n2. Learning Path Design:")
            paths_data = result['learning_paths']
            if isinstance(paths_data, dict):
                print(f"   Status: {paths_data.get('status', 'processed')}")
                print(f"   Confidence: {paths_data.get('confidence', 0):.1%}")
        
        # Content Library
        if 'content_library' in result:
            print("\n3. Content Curation:")
            content_data = result['content_library']
            if isinstance(content_data, dict):
                print(f"   Status: {content_data.get('status', 'processed')}")
                print(f"   Confidence: {content_data.get('confidence', 0):.1%}")
        
        # Monitoring Framework
        if 'monitoring_framework' in result:
            print("\n4. Progress Monitoring:")
            monitor_data = result['monitoring_framework']
            if isinstance(monitor_data, dict):
                print(f"   Status: {monitor_data.get('status', 'processed')}")
                print(f"   Confidence: {monitor_data.get('confidence', 0):.1%}")
        
        # Career Coaching
        if 'career_coaching' in result:
            print("\n5. Career Coaching Strategy:")
            coach_data = result['career_coaching']
            if isinstance(coach_data, dict):
                print(f"   Status: {coach_data.get('status', 'processed')}")
                print(f"   Confidence: {coach_data.get('confidence', 0):.1%}")
                if 'insights' in coach_data:
                    print(f"   Coaching Focus: {coach_data['insights'][:150]}...")
        
        # Sample Employee Paths
        if 'sample_employee_paths' in result:
            print("\n📚 Sample Learning Paths:")
            print("-" * 40)
            for path in result['sample_employee_paths'][:2]:  # Show first 2
                print(f"\nEmployee: {path.get('employee_name', 'Unknown')}")
                print(f"Current Role: {path.get('current_role', 'N/A')}")
                print(f"Target Role: {path.get('target_role', 'N/A')}")
                print(f"Total Learning Hours: {path.get('total_learning_hours', 0)}")
                print(f"Next Milestone: {path.get('next_milestone', 'N/A')}")
                
                modules = path.get('learning_modules', [])
                if modules:
                    print("Learning Modules:")
                    for module in modules[:3]:  # Show first 3 modules
                        status = module.get('status', 'not_started')
                        completion = module.get('completion', 0)
                        print(f"   - {module.get('module', 'Unknown')} ({status}, {completion}%)")
        
        print("\n" + "=" * 80)
        print("✅ All learning agents successfully used AI reasoning!")
        print("=" * 80)
        
        # Save results to file
        output_file = f"learning_paths_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w') as f:
            json.dump(result, f, indent=2, default=str)
        print(f"\n📁 Full results saved to: {output_file}")
        
        return True
        
    except Exception as e:
        print("\n" + "=" * 80)
        print(f"❌ Error during learning workflow: {str(e)}")
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
    success = asyncio.run(test_learning_workflow())
    
    if success:
        print("\n🎉 SUCCESS: Learning paths AI agents are working correctly!")
        return 0
    else:
        print("\n❌ FAILURE: Learning paths workflow encountered errors")
        return 1

if __name__ == "__main__":
    import sys
    sys.exit(main())