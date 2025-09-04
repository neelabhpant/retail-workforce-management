#!/usr/bin/env python3
"""
Test script to verify OpenAI API connectivity and CrewAI agent functionality
"""

import os
import sys
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process

# Load environment variables
load_dotenv()

def test_openai_connection():
    """Test basic OpenAI API connectivity"""
    print("=" * 60)
    print("Testing OpenAI API Connection")
    print("=" * 60)
    
    api_key = os.getenv('OPENAI_API_KEY', '')
    if not api_key:
        print("❌ ERROR: OPENAI_API_KEY not found in environment variables")
        return False
    
    # Mask the API key for display
    masked_key = api_key[:7] + "..." + api_key[-4:] if len(api_key) > 11 else "***"
    print(f"✓ API Key found: {masked_key}")
    
    # Create a simple test agent
    try:
        test_agent = Agent(
            role='Test Assistant',
            goal='Verify API connectivity',
            backstory='You are a helpful assistant created to test the API connection.',
            verbose=True,
            allow_delegation=False
        )
        print("✓ Agent created successfully")
        
        # Create a simple task
        test_task = Task(
            description="Say 'Hello! The API connection is working correctly.' and nothing else.",
            agent=test_agent,
            expected_output="A greeting message confirming API connectivity"
        )
        print("✓ Task created successfully")
        
        # Create and execute crew
        crew = Crew(
            agents=[test_agent],
            tasks=[test_task],
            process=Process.sequential,
            verbose=True
        )
        print("\n" + "=" * 60)
        print("Executing test crew...")
        print("=" * 60)
        
        result = crew.kickoff()
        
        print("\n" + "=" * 60)
        print("Test Result:")
        print("=" * 60)
        print(result)
        
        print("\n✓ API connection test SUCCESSFUL!")
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR during API test: {str(e)}")
        print("\nPossible issues:")
        print("1. Invalid API key")
        print("2. Network connectivity issues")
        print("3. OpenAI API service issues")
        print("4. Incorrect API key format")
        return False

def test_scheduling_agent():
    """Test a scheduling-specific agent"""
    print("\n" * 2)
    print("=" * 60)
    print("Testing Scheduling Agent with AI Reasoning")
    print("=" * 60)
    
    try:
        # Create a demand forecasting agent
        demand_agent = Agent(
            role='Demand Forecasting Specialist',
            goal='Analyze store traffic and allocate to departments',
            backstory='You are an expert in retail analytics with 10 years of experience.',
            verbose=True,
            allow_delegation=False
        )
        
        # Create a realistic task
        demand_task = Task(
            description="""
            Given a store-wide forecast of 1000 customers for Monday:
            - Allocate these customers to 3 departments: Electronics, Sales Floor, Customer Service
            - Consider that Monday is typically slower for Electronics
            - Sales Floor usually gets 40% of traffic
            - Provide specific numbers for each department
            
            Return a brief allocation with percentages.
            """,
            agent=demand_agent,
            expected_output="Department allocations with percentages and reasoning"
        )
        
        # Execute
        crew = Crew(
            agents=[demand_agent],
            tasks=[demand_task],
            process=Process.sequential,
            verbose=True
        )
        
        print("\nExecuting demand forecasting test...")
        print("-" * 60)
        result = crew.kickoff()
        
        print("\n" + "=" * 60)
        print("Demand Forecasting Result:")
        print("=" * 60)
        print(result)
        
        print("\n✓ Scheduling agent test SUCCESSFUL!")
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR in scheduling agent test: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("\n")
    print("🚀 CrewAI Agent API Test Suite")
    print("=" * 60)
    
    # Test 1: Basic API Connection
    api_test = test_openai_connection()
    
    if api_test:
        # Test 2: Scheduling Agent
        scheduling_test = test_scheduling_agent()
        
        if scheduling_test:
            print("\n" + "=" * 60)
            print("✅ ALL TESTS PASSED!")
            print("=" * 60)
            print("\nYour OpenAI API key is working correctly.")
            print("CrewAI agents can successfully use AI reasoning.")
            return 0
    
    print("\n" + "=" * 60)
    print("❌ SOME TESTS FAILED")
    print("=" * 60)
    print("\nPlease check the error messages above and:")
    print("1. Verify your OpenAI API key is correct")
    print("2. Ensure you have an active OpenAI account with credits")
    print("3. Check your network connection")
    return 1

if __name__ == "__main__":
    sys.exit(main())