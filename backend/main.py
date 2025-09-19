"""
FastAPI Application for Retail Workforce Management Demo
Main application with WebSocket support and REST API endpoints
"""

import asyncio
import json
import os
import random
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

from mock_cdp import MockCDPPlatform
# from agents import WorkforceManagementAgents  # Removed - using scheduling_agents instead
from data_generator import RetailDataGenerator

# Import CrewAI and Prophet components
from scheduling_agents import SchedulingAgentsManager
from prophet_forecasting import RetailDemandForecaster

# Import new AI agent modules
from retention_agents import retention_agents
from learning_agents import learning_agents
from sentiment_agents import sentiment_agents

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Retail Workforce Management Demo",
    description="Cloudera Data Platform Demo for Retail Workforce Management",
    version="1.0.0"
)

# CORS middleware - Allow both port 3000 and 3001
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances
cdp_platform = MockCDPPlatform()
# agents = WorkforceManagementAgents(cdp_platform)  # Removed - using scheduling_agents instead
data_generator = RetailDataGenerator()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.connection_count = 0
    
    async def connect(self, websocket: WebSocket):
        # Note: Connection is now handled in the endpoint itself
        # This method is kept for compatibility but does nothing
        pass
    
    def disconnect(self, websocket: WebSocket):
        try:
            if websocket in self.active_connections:
                self.active_connections.remove(websocket)
            print(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")
        except Exception as e:
            print(f"Error during WebSocket disconnect: {e}")
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        try:
            # Check if websocket is in active connections before sending
            if websocket not in self.active_connections:
                print("WebSocket not in active connections, skipping send")
                return
                
            await websocket.send_text(message)
        except Exception as e:
            print(f"Failed to send personal WebSocket message: {e}")
            # Remove disconnected websocket
            self.disconnect(websocket)
    
    async def broadcast(self, message: str):
        if not self.active_connections:
            print("No active WebSocket connections to broadcast to")
            return
            
        disconnected = []
        for connection in self.active_connections.copy():  # Use copy to avoid modification during iteration
            try:
                await connection.send_text(message)
            except Exception as e:
                print(f"Failed to broadcast to WebSocket connection: {e}")
                disconnected.append(connection)
        
        # Clean up disconnected connections
        for connection in disconnected:
            self.disconnect(connection)
            
        if disconnected:
            print(f"Cleaned up {len(disconnected)} disconnected WebSocket connections")

manager = ConnectionManager()

# Initialize CrewAI Scheduling Agents (AI-powered version only)
from scheduling_agents import SchedulingAgentsManager
scheduling_agents = SchedulingAgentsManager(websocket_manager=manager)
print("Using AI-powered scheduling agents with real LLM reasoning")

# Initialize Prophet components
forecaster = RetailDemandForecaster()

# In-memory data store for Prophet
data_store = {
    'prophet_forecasts': {},
    'optimization_history': []
}

# Pydantic models
class ScheduleRequest(BaseModel):
    date_range: str
    locations: List[str] = []
    departments: List[str] = []
    constraints: List[str] = []

class RetentionRequest(BaseModel):
    employee_id: Optional[str] = None
    department: Optional[str] = None

class LearningPathRequest(BaseModel):
    employee_id: str
    career_goals: Dict[str, Any] = {}

class SentimentAnalysisRequest(BaseModel):
    employee_id: Optional[str] = None
    department: Optional[str] = None
    include_team: Optional[bool] = False

class PulseSurveyRequest(BaseModel):
    focus_area: Optional[str] = "general"
    employee_ids: Optional[List[str]] = None

class PulseSurveyResponse(BaseModel):
    survey_id: str
    employee_id: str
    responses: Dict[str, Any]

class DemandForecastRequest(BaseModel):
    period: str = "2_weeks"
    locations: List[str] = []
    events: List[str] = []
    departments: List[str] = []
    use_prophet: bool = True

class DemoScenarioRequest(BaseModel):
    scenario_type: str
    parameters: Dict[str, Any] = {}

class ProphetTrainingRequest(BaseModel):
    departments: List[str]
    days_back: int = 365

class ProphetVisualizationRequest(BaseModel):
    department: str
    include_history: bool = False

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize demo data and start background tasks"""
    await initialize_demo_data()
    
    # Initialize Prophet models
    try:
        print("Initializing Prophet forecasting system...")
        default_departments = ['Sales Floor', 'Customer Service', 'Electronics']
        forecaster.generate_historical_data(days_back=365, departments=default_departments)
        
        # Pre-train Prophet models for faster response
        for dept in default_departments:
            print(f"Training Prophet model for {dept}...")
            forecaster.train_prophet_model(dept)
        
        print("Prophet initialization complete")
    except Exception as e:
        print(f"Warning: Prophet initialization failed: {e}")
        print("System will continue without Prophet forecasting")
    
    asyncio.create_task(system_heartbeat())
    asyncio.create_task(data_flow_simulation())

async def initialize_demo_data():
    """Load initial demo data into the platform"""
    print("Initializing demo data...")
    
    # Initialize CDP topics first
    await cdp_platform._initialize_topics()
    
    # Generate sample data
    employees = data_generator.generate_employees(50)
    schedules = data_generator.generate_schedules(employees, weeks=2)
    demand_data = data_generator.generate_demand_data(30)
    retention_data = data_generator.generate_retention_factors(employees)
    
    # Load into data warehouse
    await cdp_platform.data_warehouse.insert_bulk('employees', employees)
    await cdp_platform.data_warehouse.insert_bulk('schedules', schedules)
    await cdp_platform.data_warehouse.insert_bulk('demand_forecast', demand_data)
    await cdp_platform.data_warehouse.insert_bulk('retention_metrics', retention_data)
    
    # Train ML models
    import pandas as pd
    training_data = {
        'retention': pd.DataFrame(retention_data),
        'demand': pd.DataFrame(demand_data)
    }
    await cdp_platform.ml_platform.train_models(training_data)
    
    await cdp_platform.log_event('system', 'demo_data_initialized', {
        'employees': len(employees),
        'schedules': len(schedules),
        'demand_records': len(demand_data)
    })
    
    print("Demo data initialization complete")

async def system_heartbeat():
    """Send periodic system status updates"""
    while True:
        try:
            status = await cdp_platform.get_platform_status()
            await manager.broadcast(json.dumps({
                'type': 'system_status',
                'data': status
            }))
            await asyncio.sleep(30)  # Every 30 seconds
        except Exception as e:
            print(f"Heartbeat error: {e}")
            await asyncio.sleep(30)

async def data_flow_simulation():
    """Simulate real-time data flow through CDP components"""
    while True:
        try:
            # Simulate various data flow events
            event_types = [
                'employee_clock_in',
                'customer_interaction',
                'inventory_update',
                'schedule_change',
                'performance_update'
            ]
            
            event_type = asyncio.get_event_loop().time() % len(event_types)
            event_name = event_types[int(event_type)]
            
            # Generate event data
            event_data = await generate_simulation_event(event_name)
            
            # Publish to data flow
            await cdp_platform.data_flow.publish('live_events', event_data)
            
            # Broadcast to connected clients
            await manager.broadcast(json.dumps({
                'type': 'data_flow_event',
                'event': event_name,
                'data': event_data
            }))
            
            await asyncio.sleep(5)  # Every 5 seconds
            
        except Exception as e:
            print(f"Data flow simulation error: {e}")
            await asyncio.sleep(5)

async def generate_simulation_event(event_type: str) -> Dict:
    """Generate realistic simulation events"""
    import random
    
    base_event = {
        'timestamp': datetime.now().isoformat(),
        'event_id': f"{event_type}_{random.randint(1000, 9999)}",
        'location_id': f"store_{random.randint(1, 5):03d}"
    }
    
    if event_type == 'employee_clock_in':
        base_event.update({
            'employee_id': f"emp_{random.randint(1, 50):03d}",
            'action': random.choice(['clock_in', 'clock_out', 'break_start', 'break_end'])
        })
    elif event_type == 'customer_interaction':
        base_event.update({
            'customer_count': random.randint(1, 15),
            'department': random.choice(['Sales Floor', 'Electronics', 'Customer Service']),
            'interaction_type': random.choice(['purchase', 'return', 'inquiry', 'complaint'])
        })
    elif event_type == 'performance_update':
        base_event.update({
            'employee_id': f"emp_{random.randint(1, 50):03d}",
            'metric': random.choice(['sales_total', 'customer_rating', 'efficiency_score']),
            'value': round(random.uniform(1, 5), 2)
        })
    
    return base_event

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    # Accept the connection
    await websocket.accept()
    manager.active_connections.append(websocket)
    print(f"WebSocket connected. Total connections: {len(manager.active_connections)}")
    
    try:
        # Send initial connection confirmation
        await websocket.send_text(json.dumps({
            'type': 'connection_status',
            'status': 'connected',
            'message': 'WebSocket connection established'
        }))
        
        # Main message handling loop - stays in the same context
        while True:
            try:
                # Receive message directly without timeout or background task
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Handle different message types
                if message.get('type') == 'subscribe':
                    topic = message.get('topic')
                    await cdp_platform.data_flow.subscribe(topic, 
                        lambda msg: manager.send_personal_message(json.dumps(msg), websocket))
                elif message.get('type') == 'ping':
                    # Respond to ping with pong to keep connection alive
                    await websocket.send_text(json.dumps({
                        'type': 'pong',
                        'timestamp': datetime.now().isoformat()
                    }))
                    print("Responded to ping with pong")
                    
            except json.JSONDecodeError as e:
                print(f"Failed to parse WebSocket message: {e}")
                await websocket.send_text(json.dumps({
                    'type': 'error',
                    'message': 'Invalid JSON format'
                }))
            except WebSocketDisconnect:
                print("WebSocket client disconnected")
                break
            except Exception as e:
                print(f"Error in WebSocket message handling: {e}")
                # Try to send error message
                try:
                    await websocket.send_text(json.dumps({
                        'type': 'error',
                        'message': f'Server error: {str(e)}'
                    }))
                except:
                    # Connection is broken, exit loop
                    break
                    
    except Exception as e:
        print(f"WebSocket endpoint error: {e}")
    finally:
        # Clean up the connection
        if websocket in manager.active_connections:
            manager.active_connections.remove(websocket)
            print(f"WebSocket disconnected. Total connections: {len(manager.active_connections)}")

# REST API Endpoints

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Retail Workforce Management Demo API", "status": "running"}

@app.get("/api/platform/status")
async def get_platform_status():
    """Get overall CDP platform status"""
    return await cdp_platform.get_platform_status()

@app.get("/api/platform/events")
async def get_platform_events(limit: int = 50):
    """Get recent platform events"""
    return cdp_platform.event_log[-limit:]

@app.get("/api/data/employees")
async def get_employees(department: str = None, limit: int = 100):
    """Get employee data"""
    query = "SELECT * FROM employees"
    params = None
    
    if department:
        query += " WHERE department = ?"
        params = {'department': department}
    
    query += f" LIMIT {limit}"
    
    employees = await cdp_platform.data_warehouse.query(query, params)
    return {"employees": employees}

@app.get("/api/data/schedules")
async def get_schedules(employee_id: str = None, date_range: str = "current_week"):
    """Get schedule data"""
    
    # Calculate date range
    today = datetime.now().date()
    if date_range == "current_week":
        start_date = today - timedelta(days=today.weekday())
        end_date = start_date + timedelta(days=6)
    elif date_range == "next_week":
        start_date = today - timedelta(days=today.weekday()) + timedelta(weeks=1)
        end_date = start_date + timedelta(days=6)
    else:
        start_date = today
        end_date = today + timedelta(days=7)
    
    query = "SELECT * FROM schedules WHERE shift_date BETWEEN ? AND ?"
    params = [start_date.isoformat(), end_date.isoformat()]
    
    if employee_id:
        query += " AND employee_id = ?"
        params.append(employee_id)
    
    schedules = await cdp_platform.data_warehouse.query(query, params)
    return {
        "schedules": schedules,
        "period": {
            "start": start_date.isoformat(),
            "end": end_date.isoformat(),
            "range": date_range
        }
    }

@app.get("/api/data/demand-forecast")
async def get_demand_forecast(location_id: str = None, days: int = 14):
    """Get demand forecast data"""
    query = "SELECT * FROM demand_forecast WHERE forecast_date >= ?"
    params = [datetime.now().date().isoformat()]
    
    if location_id:
        query += " AND location_id = ?"
        params.append(location_id)
    
    query += f" ORDER BY forecast_date LIMIT {days * 5}"  # Assuming 5 records per day
    
    forecasts = await cdp_platform.data_warehouse.query(query, params)
    return {"forecasts": forecasts}

@app.get("/api/data/retention-metrics")
async def get_retention_metrics(employee_id: str = None):
    """Get retention risk metrics"""
    query = "SELECT rm.*, e.name, e.department FROM retention_metrics rm JOIN employees e ON rm.employee_id = e.employee_id"
    params = None
    
    if employee_id:
        query += " WHERE rm.employee_id = ?"
        params = [employee_id]
    
    query += " ORDER BY rm.risk_score DESC"
    
    metrics = await cdp_platform.data_warehouse.query(query, params)
    return {"retention_metrics": metrics}

# Agent endpoints
@app.post("/api/agents/optimize-schedule")
async def optimize_schedule(request: ScheduleRequest):
    """Generate optimized schedule using AI agents"""
    try:
        result = await agents.optimize_schedule(request.dict())
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/agents/analyze-retention")
async def analyze_retention(request: RetentionRequest):
    """Analyze employee retention risks with sentiment analysis"""
    try:
        # Get employee data based on request parameters
        if request.employee_id:
            # Single employee analysis
            employees = await cdp_platform.data_warehouse.query(
                "SELECT * FROM employees WHERE employee_id = ?",
                [request.employee_id]
            )
            if not employees:
                raise HTTPException(status_code=404, detail="Employee not found")
        elif request.department:
            # Department-wide analysis
            employees = await cdp_platform.data_warehouse.query(
                "SELECT * FROM employees WHERE department = ?",
                [request.department]
            )
        else:
            # Full workforce analysis
            employees = await cdp_platform.data_warehouse.query(
                "SELECT * FROM employees"
            )
        
        # Run comprehensive retention analysis with sentiment integration
        result = await retention_agents.analyze_retention_risks(
            employee_data=employees,
            historical_data={
                'turnover_rate': 0.15,
                'avg_tenure': 730,
                'focus': 'individual' if request.employee_id else 'department' if request.department else 'company'
            }
        )
        
        # Format response for frontend
        formatted_result = {
            'analysis_id': result.get('analysis_id'),
            'timestamp': result.get('timestamp'),
            'employees': [],
            'summary': {
                'total_employees': 0,  # Will be updated with actual processed count
                'high_risk_count': 0,  # Will be calculated from actual data
                'medium_risk_count': 0,  # Will be calculated from actual data
                'low_risk_count': 0,  # Will be calculated from actual data
                'average_risk_score': 0,  # Will be calculated from actual data
                'top_risk_factors': result.get('executive_summary', {}).get('top_risk_factors', [])
            },
            'department_trends': {},
            'recommendations': [],
            'risk_factors': result.get('executive_summary', {}).get('top_risk_factors', [])
        }
        
        # Process employee data with sentiment scores
        # Process all employees or limit for performance based on department filter
        employee_limit = 50 if request.department else len(employees)  # Limit only for company-wide analysis
        for emp in employees[:employee_limit]:
            # Convert Decimal to float for arithmetic operations
            satisfaction = float(emp.get('satisfaction_score', 3.5))
            performance = float(emp.get('performance_score', 3.5))
            risk_score = (100 - satisfaction * 20) / 100  # Convert satisfaction to risk
            
            # Generate risk factors based on employee data
            risk_factors = []
            interventions = []
            
            # Adjust risk based on multiple factors including sentiment
            overtime = float(emp.get('overtime_hours', 0))
            if overtime > 10:
                risk_score = min(1.0, risk_score + 0.2)
                risk_factors.append("Excessive overtime hours (burnout risk)")
                interventions.append("Review and redistribute workload")
                interventions.append("Consider additional team resources")
            
            tenure = float(emp.get('tenure_days', 365))
            if tenure < 180:
                risk_score = min(1.0, risk_score + 0.15)
                risk_factors.append("New employee - critical retention period")
                interventions.append("Enhance onboarding support")
                interventions.append("Assign mentor or buddy")
            elif tenure < 730:  # Less than 2 years
                risk_factors.append("Early career stage - growth expectations")
                interventions.append("Discuss career development path")
            
            # Add satisfaction-based risk factors
            if satisfaction < 3:
                risk_factors.append("Low job satisfaction score")
                interventions.append("Schedule 1-on-1 to discuss concerns")
                interventions.append("Review compensation and benefits")
            elif satisfaction < 3.5:
                risk_factors.append("Below average satisfaction")
                interventions.append("Conduct engagement survey")
            
            # Add performance-based risk factors
            if performance < 3:
                risk_factors.append("Performance improvement needed")
                interventions.append("Develop performance improvement plan")
                interventions.append("Provide additional training/support")
            elif performance > 4.5:
                risk_factors.append("High performer - retention priority")
                interventions.append("Recognition and advancement opportunities")
                interventions.append("Ensure competitive compensation")
            
            # If no specific risk factors, add general ones based on risk score
            if not risk_factors:
                if risk_score >= 0.7:
                    risk_factors.append("High retention risk - multiple indicators")
                    interventions.append("Immediate manager intervention")
                elif risk_score >= 0.4:
                    risk_factors.append("Moderate retention risk")
                    interventions.append("Monitor closely and check in regularly")
                else:
                    risk_factors.append("Low retention risk - stable")
                    interventions.append("Maintain current engagement level")
            
            formatted_result['employees'].append({
                'employee_id': emp.get('employee_id'),
                'name': emp.get('name'),
                'department': emp.get('department'),
                'risk_score': risk_score,
                'tenure_months': int(tenure) // 30,
                'satisfaction_score': satisfaction,
                'performance_score': performance,
                'risk_factors': risk_factors[:3],  # Limit to top 3 risk factors
                'interventions': interventions[:3],  # Limit to top 3 interventions
                'sentiment_trend': 'stable'  # Will be enhanced with real sentiment tracking
            })
            
            # Update risk counts
            if risk_score >= 0.7:
                formatted_result['summary']['high_risk_count'] += 1
            elif risk_score >= 0.4:
                formatted_result['summary']['medium_risk_count'] += 1
            else:
                formatted_result['summary']['low_risk_count'] += 1
        
        # Calculate department trends
        dept_groups = {}
        for emp in formatted_result['employees']:
            dept = emp['department']
            if dept not in dept_groups:
                dept_groups[dept] = []
            dept_groups[dept].append(emp['risk_score'])
        
        for dept, scores in dept_groups.items():
            formatted_result['department_trends'][dept] = sum(scores) / len(scores) if scores else 0
        
        # Update summary with actual counts and average
        formatted_result['summary']['total_employees'] = len(formatted_result['employees'])
        
        # Calculate average risk score from actual processed employees
        if formatted_result['employees']:
            total_risk = sum(emp['risk_score'] for emp in formatted_result['employees'])
            formatted_result['summary']['average_risk_score'] = total_risk / len(formatted_result['employees'])
        
        # Extract recommendations from AI analysis
        if result.get('retention_strategy'):
            strategy = result['retention_strategy']
            if isinstance(strategy, dict):
                formatted_result['recommendations'] = strategy.get('insights', '').split('\n')[:5]
            else:
                formatted_result['recommendations'] = [str(strategy)[:200]]
        
        # Add default recommendations if none from AI
        if not formatted_result['recommendations']:
            formatted_result['recommendations'] = [
                "Implement regular pulse surveys for continuous feedback",
                "Review workload distribution across teams",
                "Enhance career development programs",
                "Improve work-life balance initiatives",
                "Strengthen recognition and rewards programs"
            ]
        
        return {"success": True, "data": formatted_result}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Retention analysis error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/agents/create-learning-path")
async def create_learning_path(request: LearningPathRequest):
    """Create personalized learning path using CrewAI agents"""
    try:
        # Get employee data
        employee = await cdp_platform.data_warehouse.query(
            "SELECT * FROM employees WHERE employee_id = ?",
            [request.employee_id]
        )
        
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")
        
        employee_data = employee[0] if isinstance(employee, list) else employee
        
        # Use the learning_agents to create personalized path
        result = await learning_agents.create_individual_learning_path(
            employee_data=employee_data,
            career_goals=request.career_goals
        )
        
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Sentiment Analysis Endpoints
@app.post("/api/sentiment/analyze")
async def analyze_sentiment(request: SentimentAnalysisRequest):
    """Perform comprehensive sentiment analysis for employees"""
    try:
        if request.employee_id:
            # Single employee sentiment analysis
            employee = await cdp_platform.data_warehouse.query(
                "SELECT * FROM employees WHERE employee_id = ?",
                [request.employee_id]
            )
            
            if not employee:
                raise HTTPException(status_code=404, detail="Employee not found")
            
            employee_data = employee[0] if isinstance(employee, list) else employee
            
            # Perform sentiment analysis
            result = await sentiment_agents.analyze_employee_sentiment(
                employee_data=employee_data,
                historical_sentiment=None,  # Would fetch from sentiment history table
                recent_events=None  # Would fetch from events table
            )
            
            return {"success": True, "data": result}
            
        elif request.department and request.include_team:
            # Team/Department sentiment analysis
            team_data = await cdp_platform.data_warehouse.query(
                "SELECT * FROM employees WHERE department = ?",
                [request.department]
            )
            
            result = await sentiment_agents.analyze_team_sentiment(
                team_data=team_data,
                department=request.department
            )
            
            return {"success": True, "data": result}
            
        else:
            # Company-wide sentiment summary
            all_employees = await cdp_platform.data_warehouse.query(
                "SELECT * FROM employees"
            )
            
            # Sample analysis for performance
            sample_size = min(20, len(all_employees))
            sample_employees = all_employees[:sample_size]
            
            sentiments = []
            for emp in sample_employees:
                sentiment = await sentiment_agents.analyze_employee_sentiment(emp)
                sentiments.append(sentiment)
            
            avg_sentiment = sum(s['sentiment_score'] for s in sentiments) / len(sentiments)
            
            return {
                "success": True,
                "data": {
                    "company_sentiment": avg_sentiment,
                    "total_analyzed": len(sentiments),
                    "sentiment_distribution": {
                        "positive": len([s for s in sentiments if s['sentiment_score'] > 70]),
                        "neutral": len([s for s in sentiments if 40 <= s['sentiment_score'] <= 70]),
                        "negative": len([s for s in sentiments if s['sentiment_score'] < 40])
                    },
                    "top_concerns": ["Workload pressure", "Career growth", "Work-life balance"],
                    "recommendations": [
                        "Implement weekly pulse surveys",
                        "Review workload distribution",
                        "Enhance career development programs"
                    ]
                }
            }
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Sentiment analysis error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/sentiment/pulse-survey")
async def create_pulse_survey(request: PulseSurveyRequest):
    """Generate and distribute pulse surveys"""
    try:
        # Generate survey based on focus area
        survey = sentiment_agents.generate_pulse_survey(request.focus_area)
        
        # If specific employees are targeted
        if request.employee_ids:
            survey['target_employees'] = request.employee_ids
            survey['distribution_type'] = 'targeted'
        else:
            survey['distribution_type'] = 'company_wide'
        
        # Store survey configuration (in production, this would be saved to database)
        survey['status'] = 'active'
        survey['responses_received'] = 0
        survey['target_responses'] = len(request.employee_ids) if request.employee_ids else 100
        
        # Broadcast survey availability via WebSocket
        await manager.broadcast(json.dumps({
            'type': 'pulse_survey_available',
            'survey': survey
        }))
        
        return {"success": True, "data": survey}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/sentiment/pulse-survey/respond")
async def submit_pulse_response(response: PulseSurveyResponse):
    """Submit response to pulse survey"""
    try:
        # Validate survey exists (in production, check database)
        # Process and store response
        
        # Calculate sentiment from responses
        sentiment_score = 50  # Base score
        
        for question_id, answer in response.responses.items():
            if isinstance(answer, (int, float)):
                # Scale questions contribute directly
                sentiment_score += (answer - 5) * 5  # Adjust based on 1-10 scale
            elif answer == True:
                sentiment_score += 10
            elif answer == False:
                sentiment_score -= 10
        
        # Ensure score is within bounds
        sentiment_score = max(0, min(100, sentiment_score))
        
        # Broadcast real-time sentiment update
        await manager.broadcast(json.dumps({
            'type': 'sentiment_update',
            'employee_id': response.employee_id,
            'sentiment_score': sentiment_score,
            'survey_id': response.survey_id
        }))
        
        return {
            "success": True,
            "data": {
                "survey_id": response.survey_id,
                "response_recorded": True,
                "calculated_sentiment": sentiment_score
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sentiment/trends/{employee_id}")
async def get_sentiment_trends(employee_id: str, days: int = 30):
    """Get historical sentiment trends for an employee"""
    try:
        # In production, fetch from sentiment history table
        # For demo, generate sample trend data
        trend_data = []
        current_date = datetime.now()
        base_sentiment = 70
        
        for day in range(days):
            date = current_date - timedelta(days=day)
            # Create realistic fluctuation
            daily_variation = random.uniform(-10, 10)
            sentiment = max(20, min(95, base_sentiment + daily_variation))
            
            trend_data.append({
                'date': date.isoformat(),
                'sentiment_score': sentiment,
                'data_source': 'pulse_survey' if day % 7 == 0 else 'behavioral_analysis'
            })
        
        return {
            "success": True,
            "data": {
                "employee_id": employee_id,
                "period_days": days,
                "trends": trend_data,
                "current_sentiment": trend_data[0]['sentiment_score'],
                "average_sentiment": sum(t['sentiment_score'] for t in trend_data) / len(trend_data),
                "trend_direction": "improving" if trend_data[0]['sentiment_score'] > trend_data[-1]['sentiment_score'] else "declining"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/agents/forecast-demand")
async def forecast_demand(request: DemandForecastRequest):
    """Generate demand forecast"""
    try:
        result = await agents.forecast_demand(request.dict())
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# CrewAI endpoint
@app.post("/api/agents/optimize-schedule-crewai")
async def optimize_schedule_crewai(request: ScheduleRequest):
    """Advanced schedule optimization using CrewAI agents with Prophet forecast"""
    try:
        # Convert request to dict format expected by agents
        request_dict = {
            'date_range': request.date_range,
            'locations': request.locations,
            'departments': request.departments,
            'constraints': request.constraints
        }
        
        # Get Prophet forecast for the requested period (store-wide)
        prophet_forecast = {
            'total_weekly_customers': 7000,
            'daily_customers': [],
            'peak_days': ['Friday', 'Saturday']
        }
        
        # Generate or get actual Prophet forecast
        try:
            # Use existing Prophet models if available
            if forecaster.models:
                # Get forecast for next 7 days
                days_ahead = 7
                store_forecast = forecaster.forecast_all_departments(days_ahead)
                
                # Aggregate to store-level
                daily_totals = []
                for day in range(days_ahead):
                    day_total = sum(
                        dept_forecast['forecast'][day] 
                        for dept_forecast in store_forecast.values()
                    )
                    daily_totals.append(int(day_total))
                
                prophet_forecast = {
                    'total_weekly_customers': sum(daily_totals),
                    'daily_customers': daily_totals,
                    'peak_days': ['Friday', 'Saturday']  # Could be calculated from data
                }
                print(f"Using Prophet forecast: {prophet_forecast['total_weekly_customers']} weekly customers")
        except Exception as e:
            print(f"Prophet forecast failed, using defaults: {e}")
            # Use default forecast
            prophet_forecast = {
                'total_weekly_customers': 7000,
                'daily_customers': [950, 980, 1000, 1050, 1200, 1400, 1420],
                'peak_days': ['Friday', 'Saturday']
            }
        
        # Run AI-powered CrewAI optimization with Prophet forecast
        # Set a timeout for the entire operation
        try:
            result = await asyncio.wait_for(
                scheduling_agents.optimize_schedule_with_agents(request_dict, prophet_forecast),
                timeout=180  # 3 minutes total timeout
            )
        except asyncio.TimeoutError:
            print("ERROR: Schedule optimization timed out after 3 minutes")
            # Generate a basic fallback schedule
            result = {
                'optimization_id': f'timeout_{datetime.now().strftime("%Y%m%d_%H%M%S")}',
                'shifts': [],
                'error': 'Optimization timed out - using simplified schedule',
                'total_cost': 0,
                'coverage_score': 0.5
            }
            
            # Generate basic shifts
            for day_idx in range(7):
                for dept in request.departments:
                    result['shifts'].append({
                        'id': f'timeout_{day_idx}_{dept}',
                        'day': day_idx,
                        'department': dept,
                        'employee_id': f'emp_{day_idx % 10:03d}',
                        'employee_name': f'Employee {(day_idx % 10) + 1}',
                        'start_time': '09:00',
                        'end_time': '17:00',
                        'hourly_wage': 20,
                        'confidence': 0.5,
                        'reason': 'Fallback schedule due to timeout'
                    })
        
        # Ensure we have shifts in the result
        if not result.get('shifts'):
            print("WARNING: No shifts returned from optimization, generating emergency fallback")
            # Generate basic shifts for requested departments
            shifts = []
            for day_idx in range(7):
                for dept in request.departments:
                    shifts.append({
                        'id': f'fallback_{day_idx}_{dept}',
                        'day': day_idx,
                        'department': dept,
                        'employee_id': f'emp_{day_idx}',
                        'employee_name': f'Employee {day_idx}',
                        'start_time': '09:00',
                        'end_time': '17:00',
                        'confidence': 0.5,
                        'reason': 'Emergency fallback shift'
                    })
            result['shifts'] = shifts
            result['total_shifts'] = len(shifts)
            print(f"Generated {len(shifts)} emergency fallback shifts")
        
        return {"success": True, "data": result}
        
    except Exception as e:
        print(f"CrewAI scheduling error: {e}")
        import traceback
        traceback.print_exc()
        
        # Return error details for debugging
        return {
            "success": False, 
            "error": str(e),
            "data": {
                "optimization_id": f"error_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "shifts": [],
                "total_shifts": 0,
                "total_cost": 0,
                "cost_savings": 0,
                "coverage_score": 0,
                "employee_satisfaction": 0,
                "recommendations": ["Error occurred during optimization"],
                "risks": [str(e)]
            }
        }

# Prophet endpoints
@app.get("/api/prophet/status")
async def get_prophet_status():
    """Get Prophet system status"""
    return {
        'status': 'active',
        'models_trained': list(forecaster.models.keys()),
        'historical_data_points': len(forecaster.historical_data) if forecaster.historical_data is not None else 0,
        'cached_forecasts': len(forecaster.forecast_results),
        'last_update': datetime.now().isoformat()
    }

@app.post("/api/prophet/train")
async def train_prophet_models(request: ProphetTrainingRequest):
    """Train Prophet models for specified departments"""
    try:
        # Generate historical data
        forecaster.generate_historical_data(
            days_back=request.days_back,
            departments=request.departments
        )
        
        trained_models = []
        for dept in request.departments:
            model = forecaster.train_prophet_model(dept)
            trained_models.append(dept)
        
        return {
            "success": True,
            "models_trained": trained_models,
            "message": f"Successfully trained {len(trained_models)} Prophet models"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/prophet/forecast")
async def generate_prophet_forecast(request: DemandForecastRequest):
    """Generate demand forecast using Prophet"""
    try:
        departments = request.departments or ['Sales Floor', 'Customer Service', 'Electronics']
        
        # Ensure models are trained
        for dept in departments:
            if dept not in forecaster.models:
                if forecaster.historical_data is None:
                    forecaster.generate_historical_data(days_back=365, departments=[dept])
                forecaster.train_prophet_model(dept)
        
        # Generate forecasts
        all_forecasts = forecaster.forecast_all_departments(
            departments=departments,
            periods=14 if request.period == "2_weeks" else 7
        )
        
        # Get insights
        insights = forecaster.get_optimization_insights(departments)
        
        # Format response
        predictions = []
        for dept, forecast_df in all_forecasts.items():
            future_forecast = forecast_df[forecast_df['ds'] > datetime.now()].head(14)
            
            for _, row in future_forecast.iterrows():
                # Get hourly distribution
                hourly_dist = forecaster.get_hourly_distribution(
                    int(row['yhat']),
                    dept
                )
                
                predictions.append({
                    'date': row['ds'].strftime('%Y-%m-%d'),
                    'day_of_week': row['ds'].strftime('%A'),
                    'department': dept,
                    'total_predicted_customers': int(row['yhat']),
                    'confidence_lower': int(row['yhat_lower']),
                    'confidence_upper': int(row['yhat_upper']),
                    'total_required_staff': int(row['required_staff']),
                    'hourly_predictions': hourly_dist,
                    'prophet_components': {
                        'trend': float(row.get('trend', 0)),
                        'weekly': float(row.get('weekly', 0)),
                        'yearly': float(row.get('yearly', 0))
                    }
                })
        
        # Cache the forecast
        forecast_id = f'prophet_{datetime.now().strftime("%Y%m%d_%H%M%S")}'
        data_store['prophet_forecasts'][forecast_id] = {
            'predictions': predictions,
            'insights': insights,
            'timestamp': datetime.now().isoformat()
        }
        
        return {
            "success": True,
            "data": {
                "forecast_id": forecast_id,
                "period_start": predictions[0]['date'] if predictions else None,
                "period_end": predictions[-1]['date'] if predictions else None,
                "predictions": predictions,
                "insights": insights,
                "summary": {
                    "departments_forecasted": departments,
                    "total_predictions": len(predictions),
                    "average_confidence": sum(i for i in insights['confidence_scores'].values()) / len(insights['confidence_scores']) if insights['confidence_scores'] else 0,
                    # Add fields expected by frontend
                    "avg_daily_customers": round(sum(p['total_predicted_customers'] for p in predictions) / len(predictions)) if predictions else 0,
                    "peak_day": max(predictions, key=lambda x: x['total_predicted_customers'])['date'] if predictions else None,
                    "total_staff_hours_needed": sum(p['total_required_staff'] * 8 for p in predictions) if predictions else 0,
                    "confidence_score": sum(i for i in insights['confidence_scores'].values()) / len(insights['confidence_scores']) if insights['confidence_scores'] else 0.85
                }
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/prophet/visualize")
async def get_prophet_visualization(request: ProphetVisualizationRequest):
    """Get Prophet forecast visualization data"""
    try:
        # Ensure model is trained
        if request.department not in forecaster.models:
            if forecaster.historical_data is None:
                forecaster.generate_historical_data(days_back=365, departments=[request.department])
            forecaster.train_prophet_model(request.department)
        
        # Generate forecast if not cached
        if request.department not in forecaster.forecast_results:
            forecaster.forecast_demand(request.department, periods=14)
        
        # Get visualization JSON
        viz_json = forecaster.create_forecast_visualization(request.department)
        
        return JSONResponse(content={
            "success": True,
            "department": request.department,
            "visualization": json.loads(viz_json) if viz_json else None
        })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/agents/optimize-schedule-prophet")
async def optimize_schedule_with_prophet(request: ScheduleRequest, background_tasks: BackgroundTasks):
    """Advanced schedule optimization using Prophet and CrewAI agents"""
    
    try:
        # Start agent optimization with Prophet in background
        result = await prophet_scheduling_manager.optimize_schedule_with_prophet({
            'date_range': request.date_range,
            'locations': request.locations,
            'departments': request.departments,
            'constraints': request.constraints
        })
        
        if result:
            # Store in history
            data_store['optimization_history'].append({
                'timestamp': datetime.now().isoformat(),
                'request': request.dict(),
                'result_id': result['optimization_id']
            })
            
            return {"success": True, "data": result}
        else:
            return {"success": False, "error": "Optimization failed"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/prophet/export/{department}")
async def export_prophet_forecast(department: str, format: str = "json"):
    """Export Prophet forecast data for a department"""
    try:
        if department not in forecaster.forecast_results:
            raise HTTPException(status_code=404, detail=f"No forecast found for {department}")
        
        export_data = forecaster.export_forecast_data([department], format=format)
        
        return JSONResponse(content={
            "success": True,
            "department": department,
            "data": json.loads(export_data) if format == "json" else export_data
        })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/prophet/insights")
async def get_all_prophet_insights():
    """Get insights from all Prophet forecasts"""
    try:
        departments = list(forecaster.models.keys())
        
        if not departments:
            return {
                "success": False,
                "message": "No Prophet models trained yet"
            }
        
        # Generate fresh forecasts if needed
        for dept in departments:
            if dept not in forecaster.forecast_results:
                forecaster.forecast_demand(dept, periods=14)
        
        # Get comprehensive insights
        insights = forecaster.get_optimization_insights(departments)
        
        # Add model performance metrics
        model_metrics = {}
        for dept in departments:
            if dept in forecaster.forecast_results:
                forecast = forecaster.forecast_results[dept]
                future_forecast = forecast[forecast['ds'] > datetime.now()]
                
                if len(future_forecast) > 0:
                    # Calculate prediction interval width as uncertainty measure
                    avg_uncertainty = (
                        (future_forecast['yhat_upper'] - future_forecast['yhat_lower']) / 
                        future_forecast['yhat']
                    ).mean()
                    
                    model_metrics[dept] = {
                        'uncertainty': round(avg_uncertainty, 3),
                        'confidence': round(1 - avg_uncertainty, 3),
                        'forecast_days': len(future_forecast)
                    }
        
        return {
            "success": True,
            "insights": insights,
            "model_metrics": model_metrics,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Demo scenarios
@app.post("/api/demo/scenario")
async def run_demo_scenario(request: DemoScenarioRequest, background_tasks: BackgroundTasks):
    """Run automated demo scenario"""
    try:
        scenario_data = data_generator.generate_demo_scenario_data(request.scenario_type)
        
        # Start scenario execution in background
        background_tasks.add_task(execute_demo_scenario, request.scenario_type, scenario_data)
        
        return {
            "success": True,
            "scenario": request.scenario_type,
            "data": scenario_data,
            "message": "Demo scenario started"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def execute_demo_scenario(scenario_type: str, scenario_data: Dict):
    """Execute demo scenario with real-time CDP events"""
    
    await cdp_platform.log_event('demo', 'scenario_started', {
        'type': scenario_type,
        'timestamp': datetime.now().isoformat()
    })
    
    if scenario_type == 'black_friday':
        # Simulate Black Friday real-time response with CDP components
        events = [
            {
                'event': 'customer_surge',
                'data': {
                    'surge_percent': 200,
                    'department': 'Electronics',
                    'current_customers': scenario_data.get('surge_traffic', 1350)
                },
                'businessContext': f"🚨 POS systems detect 200% surge: {scenario_data.get('surge_traffic', 1350)} customers in Electronics",
                'impact': {'metric': 'predictions', 'value': 1, 'unit': 'count'}
            },
            {
                'event': 'demand_forecast',
                'data': {
                    'accuracy': 96,
                    'period': '2 hours',
                    'predicted_peak': 1500
                },
                'businessContext': '📈 ML models predict 2-hour surge duration with 96% confidence',
                'impact': {'metric': 'efficiency', 'value': 15, 'unit': 'percent'}
            },
            {
                'event': 'schedule_optimization',
                'data': {
                    'staff_moved': 5,
                    'from_department': 'Stockroom',
                    'to_department': 'Electronics',
                    'cost_saved': 2400,
                    'efficiency_gain': 18
                },
                'businessContext': '✅ CDP optimized: Moving 5 staff from Stockroom to Electronics, $2,400 saved',
                'impact': {'metric': 'cost_saved', 'value': 2400, 'unit': 'dollars'}
            },
            {
                'event': 'compliance_check',
                'data': {
                    'violations': 0,
                    'schedules_checked': 45
                },
                'businessContext': '🛡️ Ranger validated: All 45 schedules comply with labor laws during surge',
                'impact': {'metric': 'issues_prevented', 'value': 1, 'unit': 'count'}
            },
            {
                'event': 'customer_surge',
                'data': {
                    'wait_time_reduced': 8,
                    'customer_satisfaction': 12
                },
                'businessContext': '📊 Result: Wait times reduced by 8 minutes, satisfaction up 12%',
                'impact': {'metric': 'satisfaction', 'value': 12, 'unit': 'percent'}
            }
        ]
        
        for i, event_data in enumerate(events):
            await asyncio.sleep(2.5)  # Simulate CDP processing time
            
            # Broadcast the rich event
            await manager.broadcast(json.dumps({
                'type': 'data_flow_event',
                **event_data
            }))
            
            await cdp_platform.log_event('demo', 'cdp_process', {
                'scenario': scenario_type,
                'event': event_data['event'],
                'progress': (i + 1) / len(events)
            })
    
    elif scenario_type == 'staff_shortage':
        # Simulate staff shortage response with CDP
        events = [
            {
                'event': 'retention_alert',
                'data': {
                    'missing_staff': 3,
                    'departments': ['Customer Service', 'Electronics'],
                    'shift': 'Morning'
                },
                'businessContext': '⚠️ Alert: 3 employees called out - Customer Service and Electronics understaffed',
                'impact': {'metric': 'predictions', 'value': 1, 'unit': 'count'}
            },
            {
                'event': 'demand_forecast',
                'data': {
                    'current_coverage': 75,
                    'required_coverage': 95,
                    'gap': 20
                },
                'businessContext': '📊 ML Analysis: Current 75% coverage, need 95% for expected 520 customers',
                'impact': {'metric': 'staff_optimized', 'value': 3, 'unit': 'count'}
            },
            {
                'event': 'schedule_optimization',
                'data': {
                    'cross_trained_found': 4,
                    'reallocated': 3,
                    'break_adjusted': 2
                },
                'businessContext': '🔄 CDP found 4 cross-trained staff available, reallocating 3 employees',
                'impact': {'metric': 'efficiency', 'value': 22, 'unit': 'percent'}
            },
            {
                'event': 'schedule_optimization',
                'data': {
                    'overtime_avoided': 6,
                    'cost_saved': 450
                },
                'businessContext': '✅ Optimized: Coverage maintained, 6 overtime hours avoided, $450 saved',
                'impact': {'metric': 'cost_saved', 'value': 450, 'unit': 'dollars'}
            }
        ]
        
        for i, event_data in enumerate(events):
            await asyncio.sleep(2)
            
            await manager.broadcast(json.dumps({
                'type': 'data_flow_event',
                **event_data
            }))
            
            await cdp_platform.log_event('demo', 'cdp_process', {
                'scenario': scenario_type,
                'event': event_data['event'],
                'progress': (i + 1) / len(events)
            })
    
    elif scenario_type == 'predictive_scheduling':
        # Simulate predictive scheduling with CDP
        events = [
            {
                'event': 'demand_forecast',
                'data': {
                    'forecast_days': 7,
                    'accuracy': 94,
                    'peak_day': 'Saturday'
                },
                'businessContext': '📅 Analyzing 365 days of historical data for next week forecast',
                'impact': {'metric': 'predictions', 'value': 7, 'unit': 'count'}
            },
            {
                'event': 'ml_training',
                'data': {
                    'model': 'demand_forecast',
                    'accuracy_improvement': 3,
                    'features_used': 15
                },
                'businessContext': '🤖 ML model retrained with weather and promotion data, 3% accuracy gain',
                'impact': {'metric': 'efficiency', 'value': 3, 'unit': 'percent'}
            },
            {
                'event': 'schedule_optimization',
                'data': {
                    'schedules_generated': 45,
                    'coverage_score': 94,
                    'satisfaction_score': 87
                },
                'businessContext': '📊 Generated optimal schedules: 94% coverage, 87% employee satisfaction',
                'impact': {'metric': 'staff_optimized', 'value': 45, 'unit': 'count'}
            },
            {
                'event': 'compliance_check',
                'data': {
                    'schedules_validated': 45,
                    'compliance_score': 100
                },
                'businessContext': '🛡️ Apache Ranger validated all 45 schedules for labor law compliance',
                'impact': {'metric': 'issues_prevented', 'value': 1, 'unit': 'count'}
            },
            {
                'event': 'schedule_optimization',
                'data': {
                    'weekly_cost_saved': 3200,
                    'overtime_reduced': 18
                },
                'businessContext': '✅ Final result: $3,200 saved, 18 overtime hours eliminated',
                'impact': {'metric': 'cost_saved', 'value': 3200, 'unit': 'dollars'}
            }
        ]
        
        for i, event_data in enumerate(events):
            await asyncio.sleep(2.5)
            
            await manager.broadcast(json.dumps({
                'type': 'data_flow_event',
                **event_data
            }))
            
            await cdp_platform.log_event('demo', 'cdp_process', {
                'scenario': scenario_type,
                'event': event_data['event'],
                'progress': (i + 1) / len(events)
            })
    
    await cdp_platform.log_event('demo', 'scenario_completed', {
        'type': scenario_type,
        'timestamp': datetime.now().isoformat()
    })
    
    await manager.broadcast(json.dumps({
        'type': 'demo_complete',
        'scenario': scenario_type,
        'message': f"{scenario_type.replace('_', ' ').title()} demo completed successfully"
    }))

# Data generation endpoints
@app.post("/api/data/generate")
async def generate_sample_data(data_type: str = "all", count: int = 10):
    """Generate additional sample data"""
    try:
        result = {}
        
        if data_type in ["all", "employees"]:
            employees = data_generator.generate_employees(count)
            await cdp_platform.data_warehouse.insert_bulk('employees', employees)
            result["employees"] = len(employees)
        
        if data_type in ["all", "schedules"]:
            # Get existing employees for schedule generation
            existing_employees = await cdp_platform.data_warehouse.query(
                "SELECT employee_id, availability_hours, department FROM employees LIMIT 20"
            )
            schedules = data_generator.generate_schedules(existing_employees, weeks=1)
            await cdp_platform.data_warehouse.insert_bulk('schedules', schedules)
            result["schedules"] = len(schedules)
        
        return {"success": True, "generated": result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Machine Learning endpoints
@app.post("/api/ml/predict-retention")
async def predict_retention_risk(employee_data: Dict):
    """Predict retention risk for an employee"""
    try:
        risk_score = await cdp_platform.ml_platform.predict_retention_risk(employee_data)
        return {
            "success": True,
            "employee_id": employee_data.get("employee_id"),
            "risk_score": risk_score,
            "risk_level": "High" if risk_score > 0.7 else "Medium" if risk_score > 0.4 else "Low"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ml/forecast-customer-demand")
async def forecast_customer_demand(date_features: Dict):
    """Forecast customer demand"""
    try:
        demand = await cdp_platform.ml_platform.forecast_demand(date_features)
        return {
            "success": True,
            "predicted_demand": demand,
            "date_features": date_features
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Retention Analytics endpoints (AI-powered)
@app.post("/api/retention/analyze-risks")
async def analyze_retention_risks():
    """Analyze retention risks using AI agents"""
    try:
        # Get employee data
        employees = await cdp_platform.data_warehouse.query(
            "SELECT * FROM employees"
        )
        
        # Run AI-powered retention analysis
        result = await retention_agents.analyze_retention_risks(
            employee_data=employees,
            historical_data={'turnover_rate': 0.15, 'avg_tenure': 730}
        )
        
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/retention/risk-scores")
async def get_retention_risk_scores():
    """Get current retention risk scores"""
    try:
        # Get latest retention analysis from data store
        latest_analysis = data_store.get('latest_retention_analysis')
        if not latest_analysis:
            return {
                "success": False,
                "message": "No retention analysis available. Run /api/retention/analyze-risks first."
            }
        
        return {
            "success": True,
            "data": latest_analysis.get('risk_analysis', {})
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/retention/create-strategy")
async def create_retention_strategy(request: Dict):
    """Create targeted retention strategy"""
    try:
        # Get specific employee group
        department = request.get('department', 'all')
        risk_threshold = request.get('risk_threshold', 0.5)
        
        query = "SELECT * FROM employees"
        if department != 'all':
            query += f" WHERE department = '{department}'"
        
        employees = await cdp_platform.data_warehouse.query(query)
        
        # Filter high-risk employees
        high_risk_employees = [e for e in employees if hash(e['id']) % 10 < (risk_threshold * 10)]
        
        # Generate strategy for high-risk group
        result = await retention_agents.analyze_retention_risks(
            employee_data=high_risk_employees,
            historical_data={'focus': 'high_risk', 'department': department}
        )
        
        # Store result
        data_store['latest_retention_analysis'] = result
        
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Learning Paths endpoints (AI-powered)
@app.post("/api/learning/analyze-skills")
async def analyze_skills_gaps():
    """Analyze skills gaps using AI agents"""
    try:
        # Get employee data
        employees = await cdp_platform.data_warehouse.query(
            "SELECT * FROM employees"
        )
        
        # Define business priorities
        priorities = [
            'Customer service excellence',
            'Digital retail technology',
            'Sales and upselling',
            'Inventory management',
            'Team leadership'
        ]
        
        # Run AI-powered skills analysis
        result = await learning_agents.create_learning_paths(
            employee_data=employees,
            business_priorities=priorities
        )
        
        # Store result
        data_store['latest_learning_analysis'] = result
        
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/learning/create-paths")
async def create_learning_paths(request: Dict):
    """Create personalized learning paths"""
    try:
        department = request.get('department', 'all')
        role = request.get('role', 'all')
        
        query = "SELECT * FROM employees"
        conditions = []
        if department != 'all':
            conditions.append(f"department = '{department}'")
        if role != 'all':
            conditions.append(f"position LIKE '%{role}%'")
        
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        
        employees = await cdp_platform.data_warehouse.query(query)
        
        # Get business priorities from request or use defaults
        priorities = request.get('priorities', [
            'Customer service excellence',
            'Digital retail technology',
            'Sales techniques'
        ])
        
        # Create learning paths
        result = await learning_agents.create_learning_paths(
            employee_data=employees,
            business_priorities=priorities
        )
        
        # Store result
        data_store['learning_paths'] = result
        
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/learning/employee-paths/{employee_id}")
async def get_employee_learning_path(employee_id: str):
    """Get learning path for specific employee"""
    try:
        # Get latest learning paths
        learning_data = data_store.get('learning_paths', {})
        
        if not learning_data:
            return {
                "success": False,
                "message": "No learning paths available. Run /api/learning/create-paths first."
            }
        
        # Find employee's path
        sample_paths = learning_data.get('sample_employee_paths', [])
        employee_path = next((p for p in sample_paths if p.get('employee_id') == employee_id), None)
        
        if not employee_path:
            # Generate a default path
            employee_path = {
                'employee_id': employee_id,
                'status': 'pending_creation',
                'message': 'Learning path will be generated in next batch'
            }
        
        return {
            "success": True,
            "data": employee_path
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/learning/track-progress")
async def track_learning_progress(request: Dict):
    """Track learning progress for employee"""
    try:
        employee_id = request.get('employee_id')
        module_id = request.get('module_id')
        progress = request.get('progress', 0)
        
        # Store progress
        progress_key = f"progress_{employee_id}_{module_id}"
        data_store[progress_key] = {
            'progress': progress,
            'updated_at': datetime.now().isoformat(),
            'status': 'completed' if progress >= 100 else 'in_progress'
        }
        
        return {
            "success": True,
            "data": {
                "employee_id": employee_id,
                "module_id": module_id,
                "progress": progress,
                "status": data_store[progress_key]['status']
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/learning/recommendations")
async def get_learning_recommendations():
    """Get learning recommendations"""
    try:
        learning_data = data_store.get('latest_learning_analysis', {})
        
        if not learning_data:
            return {
                "success": False,
                "message": "No learning analysis available. Run /api/learning/analyze-skills first."
            }
        
        recommendations = {
            'priority_skills': learning_data.get('executive_summary', {}).get('priority_skills', []),
            'learning_paths': learning_data.get('learning_paths', {}),
            'content_library': learning_data.get('content_library', {})
        }
        
        return {
            "success": True,
            "data": recommendations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Data Lineage Tracking Endpoints
class LineageTrackRequest(BaseModel):
    data_type: str
    data_id: str

class LineageStageRequest(BaseModel):
    component: str
    tracking_id: str

@app.post("/api/lineage/track")
async def track_data_lineage(request: LineageTrackRequest):
    """Track data lineage through CDP pipeline"""
    try:
        # Define the data journey stages based on data type
        stages = []
        
        if request.data_type == 'schedule_change':
            stages = [
                {
                    'component': 'NiFi',
                    'stage': 'Ingestion',
                    'timestamp': 0,
                    'duration': 45,
                    'operation': 'HTTP POST received',
                    'details': f'Schedule change for {request.data_id} ingested via REST API',
                    'color': 'blue',
                    'metrics': {'size': '2.3KB', 'format': 'JSON'}
                },
                {
                    'component': 'Kafka',
                    'stage': 'Streaming',
                    'timestamp': 45,
                    'duration': 25,
                    'operation': 'Message published to topic',
                    'details': 'Published to workforce-updates topic, partition 3',
                    'color': 'green',
                    'metrics': {'topic': 'workforce-updates', 'partition': 3, 'offset': 15234}
                },
                {
                    'component': 'Spark',
                    'stage': 'Processing',
                    'timestamp': 70,
                    'duration': 85,
                    'operation': 'Stream processing & validation',
                    'details': 'Validated against labor laws, checked for conflicts',
                    'color': 'yellow',
                    'metrics': {'rules_checked': 12, 'conflicts_resolved': 2}
                },
                {
                    'component': 'Data Warehouse',
                    'stage': 'Storage',
                    'timestamp': 155,
                    'duration': 35,
                    'operation': 'Persisted to data warehouse',
                    'details': 'Stored in employees.schedules table with CDC enabled',
                    'color': 'blue',
                    'metrics': {'table': 'schedules', 'rows_affected': 1}
                },
                {
                    'component': 'CML',
                    'stage': 'ML Analysis',
                    'timestamp': 190,
                    'duration': 95,
                    'operation': 'Schedule optimization',
                    'details': 'ML model analyzed impact and optimized coverage',
                    'color': 'purple',
                    'metrics': {'model': 'schedule_optimizer_v2', 'confidence': 0.94}
                },
                {
                    'component': 'AI Agents',
                    'stage': 'Decision',
                    'timestamp': 285,
                    'duration': 40,
                    'operation': 'Generated recommendations',
                    'details': 'CrewAI agents created optimal shift adjustments',
                    'color': 'purple',
                    'metrics': {'agents_involved': 3, 'recommendations': 5}
                }
            ]
        elif request.data_type == 'traffic_surge':
            stages = [
                {
                    'component': 'NiFi',
                    'stage': 'Ingestion',
                    'timestamp': 0,
                    'duration': 35,
                    'operation': 'POS data stream',
                    'details': f'Customer traffic surge detected at {request.data_id}',
                    'color': 'blue',
                    'metrics': {'size': '5.1KB', 'format': 'JSON', 'source': 'POS'}
                },
                {
                    'component': 'Kafka',
                    'stage': 'Streaming',
                    'timestamp': 35,
                    'duration': 20,
                    'operation': 'High-priority stream',
                    'details': 'Published to traffic-alerts topic with priority flag',
                    'color': 'red',
                    'metrics': {'topic': 'traffic-alerts', 'priority': 'high'}
                },
                {
                    'component': 'Spark',
                    'stage': 'Processing',
                    'timestamp': 55,
                    'duration': 65,
                    'operation': 'Real-time analytics',
                    'details': 'Calculated surge percentage, identified departments affected',
                    'color': 'yellow',
                    'metrics': {'surge_percent': 200, 'departments': 3}
                },
                {
                    'component': 'CML',
                    'stage': 'ML Analysis',
                    'timestamp': 120,
                    'duration': 75,
                    'operation': 'Demand prediction',
                    'details': 'Prophet model predicted 2-hour surge duration',
                    'color': 'purple',
                    'metrics': {'model': 'prophet_demand', 'duration_predicted': '2hrs'}
                },
                {
                    'component': 'AI Agents',
                    'stage': 'Decision',
                    'timestamp': 195,
                    'duration': 50,
                    'operation': 'Staff reallocation',
                    'details': 'Agents identified 5 available staff for immediate deployment',
                    'color': 'purple',
                    'metrics': {'staff_reallocated': 5, 'response_time': '3min'}
                }
            ]
        else:
            # Default journey for other data types
            stages = [
                {
                    'component': 'NiFi',
                    'stage': 'Ingestion',
                    'timestamp': 0,
                    'duration': 40,
                    'operation': 'Data ingestion',
                    'details': f'{request.data_type} data received',
                    'color': 'blue',
                    'metrics': {'size': '3.5KB', 'format': 'JSON'}
                },
                {
                    'component': 'Kafka',
                    'stage': 'Streaming',
                    'timestamp': 40,
                    'duration': 30,
                    'operation': 'Stream processing',
                    'details': 'Published to appropriate topic',
                    'color': 'green',
                    'metrics': {'topic': 'general-updates'}
                },
                {
                    'component': 'Data Warehouse',
                    'stage': 'Storage',
                    'timestamp': 70,
                    'duration': 45,
                    'operation': 'Data persistence',
                    'details': 'Stored in data warehouse',
                    'color': 'blue',
                    'metrics': {'table': 'events', 'rows_affected': 1}
                }
            ]
        
        # Calculate total journey time
        total_time = sum(stage['duration'] for stage in stages)
        
        # Broadcast lineage tracking via WebSocket
        await manager.broadcast(json.dumps({
            'type': 'lineage_tracking',
            'data': {
                'tracking_id': f'track_{request.data_id}',
                'data_type': request.data_type,
                'stages': stages,
                'total_time': total_time,
                'status': 'tracking'
            }
        }))
        
        return {
            'success': True,
            'tracking_id': f'track_{request.data_id}',
            'data_type': request.data_type,
            'stages': stages,
            'total_time': total_time
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/lineage/stage/{component}/{tracking_id}")
async def get_stage_details(component: str, tracking_id: str):
    """Get detailed information about a specific stage in the data journey"""
    try:
        # Generate detailed stage information
        stage_details = {
            'NiFi': {
                'operations': [
                    'Data validation against schema',
                    'Format transformation (CSV → JSON)',
                    'Field enrichment with metadata',
                    'Routing based on data type'
                ],
                'performance': {
                    'throughput': '1,200 records/sec',
                    'latency': '45ms average',
                    'cpu_usage': '23%',
                    'memory_usage': '512MB'
                },
                'configuration': {
                    'processors': 4,
                    'flow_file_expiration': '5 min',
                    'back_pressure_threshold': '10,000'
                }
            },
            'Kafka': {
                'operations': [
                    'Message serialization',
                    'Partition assignment',
                    'Replication to brokers',
                    'Offset management'
                ],
                'performance': {
                    'throughput': '5,000 msg/sec',
                    'latency': '25ms average',
                    'partition_lag': 0,
                    'replication_factor': 3
                },
                'configuration': {
                    'brokers': 3,
                    'retention_ms': 604800000,
                    'compression_type': 'snappy'
                }
            },
            'Spark': {
                'operations': [
                    'Micro-batch processing',
                    'Data quality checks',
                    'Business rule validation',
                    'Aggregation and windowing'
                ],
                'performance': {
                    'batch_interval': '10 seconds',
                    'processing_time': '85ms average',
                    'records_processed': '10,000/batch',
                    'success_rate': '99.8%'
                },
                'transformations': [
                    'FilterTransform: Remove invalid records',
                    'MapTransform: Enrich with department data',
                    'AggregateTransform: Calculate metrics',
                    'WindowTransform: 5-minute sliding window'
                ]
            },
            'CML': {
                'operations': [
                    'Feature engineering',
                    'Model inference',
                    'Prediction generation',
                    'Confidence scoring'
                ],
                'model_details': {
                    'name': 'demand_forecaster_v3',
                    'type': 'Prophet + XGBoost ensemble',
                    'accuracy': '94.5%',
                    'last_trained': '2024-01-15',
                    'features': 25
                },
                'predictions': {
                    'next_hour': '+15% traffic',
                    'peak_time': '2:00 PM',
                    'confidence': 0.92
                }
            }
        }
        
        details = stage_details.get(component, {
            'operations': ['Processing data'],
            'performance': {'status': 'operational'}
        })
        
        return {
            'success': True,
            'component': component,
            'tracking_id': tracking_id,
            'details': details
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# New Sentiment Dashboard Endpoints
@app.get("/api/sentiment/heatmap")
async def get_sentiment_heatmap(timeframe: str = "month"):
    """Get department sentiment data for heatmap visualization"""
    try:
        # Get all employees grouped by department
        employees = await cdp_platform.data_warehouse.query(
            "SELECT * FROM employees ORDER BY department"
        )
        
        # Group by department
        departments = {}
        for emp in employees:
            dept = emp.get('department')
            if dept not in departments:
                departments[dept] = []
            departments[dept].append(emp)
        
        # Calculate weekly sentiment scores for each department
        heatmap_data = []
        for dept, dept_employees in departments.items():
            # Simulate weekly scores based on satisfaction and other factors
            weekly_scores = []
            for week in range(4):  # Last 4 weeks
                # Calculate average sentiment for the week
                week_score = 0
                for emp in dept_employees:
                    base_score = float(emp.get('satisfaction_score', 3.5)) * 20
                    # Add some variation per week
                    variation = random.uniform(-5, 5)
                    week_score += max(0, min(100, base_score + variation))
                
                weekly_scores.append(int(week_score / len(dept_employees)) if dept_employees else 50)
            
            # Determine trend
            trend = 'stable'
            if weekly_scores[-1] > weekly_scores[0] + 5:
                trend = 'up'
            elif weekly_scores[-1] < weekly_scores[0] - 5:
                trend = 'down'
            
            heatmap_data.append({
                'department': dept,
                'weeklyScores': weekly_scores,
                'trend': trend,
                'currentScore': weekly_scores[-1]
            })
        
        return {"success": True, "data": heatmap_data}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sentiment/action-queue")
async def get_action_queue(limit: int = 5):
    """Get prioritized action items based on sentiment analysis"""
    try:
        # Get employees with risk factors
        employees = await cdp_platform.data_warehouse.query(
            "SELECT * FROM employees ORDER BY satisfaction_score ASC LIMIT 20"
        )
        
        action_items = []
        
        for emp in employees[:limit]:
            satisfaction = float(emp.get('satisfaction_score', 3.5))
            overtime = float(emp.get('overtime_hours', 0))
            tenure = float(emp.get('tenure_days', 365))
            
            # Calculate priority based on multiple factors
            priority = 0
            action_type = 'review'
            action_text = ''
            
            if satisfaction < 2.5:
                priority += 40
                action_type = 'meeting'
                action_text = f"Urgent 1-on-1: Low satisfaction detected"
            elif satisfaction < 3.5:
                priority += 25
                action_type = 'intervention'
                action_text = f"Schedule check-in: Below average satisfaction"
            
            if overtime > 15:
                priority += 30
                action_type = 'review'
                action_text = f"Review schedule: Excessive overtime ({overtime} hours)"
            elif overtime > 10:
                priority += 20
                action_text = f"Monitor workload: High overtime"
            
            if tenure < 90:
                priority += 20
                action_type = 'training'
                action_text = f"Enhanced onboarding support needed"
            elif tenure < 180:
                priority += 10
                action_text = f"New employee check-in"
            
            # Calculate confidence based on data quality
            confidence = min(95, 50 + (priority * 0.5) + random.uniform(10, 20))
            
            # Estimate impact
            sentiment_improvement = int(10 + (priority * 0.3))
            cost_saving = int(10000 + (priority * 500) + random.uniform(5000, 15000))
            
            action_items.append({
                'id': str(len(action_items) + 1),
                'priority': int(min(100, priority + random.uniform(20, 40))),
                'type': action_type,
                'target': emp.get('name'),
                'department': emp.get('department'),
                'action': action_text or f"Review employee status",
                'confidence': int(confidence),
                'estimatedImpact': {
                    'sentimentImprovement': sentiment_improvement,
                    'costSaving': cost_saving,
                    'timeRequired': '30 min' if action_type == 'meeting' else '1 hour'
                },
                'status': 'pending'
            })
        
        # Sort by priority
        action_items.sort(key=lambda x: x['priority'], reverse=True)
        
        return {"success": True, "data": action_items[:limit]}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sentiment/executive-summary")
async def get_executive_summary(timeframe: str = "month"):
    """Get high-level sentiment metrics for executives"""
    try:
        # Get all employees
        employees = await cdp_platform.data_warehouse.query("SELECT * FROM employees")
        
        # Calculate overall metrics
        total_employees = len(employees)
        avg_satisfaction = sum(float(e.get('satisfaction_score', 3.5)) for e in employees) / total_employees
        avg_sentiment = avg_satisfaction * 20  # Convert to 0-100 scale
        
        # Count risk levels
        high_risk = sum(1 for e in employees if float(e.get('satisfaction_score', 3.5)) < 2.5)
        medium_risk = sum(1 for e in employees if 2.5 <= float(e.get('satisfaction_score', 3.5)) < 3.5)
        low_risk = total_employees - high_risk - medium_risk
        
        # Calculate cost at risk (simplified)
        turnover_cost_per_employee = 50000
        productivity_loss_per_risk = 10000
        recruitment_cost = 5000
        
        cost_at_risk = (high_risk * turnover_cost_per_employee + 
                       medium_risk * turnover_cost_per_employee * 0.3 +
                       (high_risk + medium_risk) * productivity_loss_per_risk)
        
        # Identify top issues
        top_issues = []
        
        # Check for department-specific issues
        dept_stats = {}
        for emp in employees:
            dept = emp.get('department')
            if dept not in dept_stats:
                dept_stats[dept] = {'count': 0, 'total_satisfaction': 0, 'overtime': 0}
            dept_stats[dept]['count'] += 1
            dept_stats[dept]['total_satisfaction'] += float(emp.get('satisfaction_score', 3.5))
            dept_stats[dept]['overtime'] += float(emp.get('overtime_hours', 0))
        
        for dept, stats in dept_stats.items():
            avg_dept_satisfaction = stats['total_satisfaction'] / stats['count']
            avg_dept_overtime = stats['overtime'] / stats['count']
            
            if avg_dept_overtime > 10:
                top_issues.append({
                    'id': f"issue_{len(top_issues) + 1}",
                    'description': f"{dept} department overtime exceeding limits",
                    'affectedCount': stats['count'],
                    'severity': 'critical' if avg_dept_overtime > 15 else 'high',
                    'department': dept
                })
            
            if avg_dept_satisfaction < 3:
                top_issues.append({
                    'id': f"issue_{len(top_issues) + 1}",
                    'description': f"Low satisfaction in {dept} department",
                    'affectedCount': stats['count'],
                    'severity': 'high',
                    'department': dept
                })
        
        # Add general issues
        if high_risk > 5:
            top_issues.append({
                'id': f"issue_{len(top_issues) + 1}",
                'description': f"High turnover risk affecting {high_risk} employees",
                'affectedCount': high_risk,
                'severity': 'critical',
                'department': 'Multiple'
            })
        
        # Generate quick wins
        quick_wins = []
        
        if any('overtime' in issue['description'] for issue in top_issues):
            quick_wins.append({
                'id': 'qw_1',
                'action': 'Optimize schedules to reduce overtime',
                'estimatedImpact': '+10% satisfaction, $20K saved',
                'timeToImplement': '3 days',
                'owner': 'Operations Manager'
            })
        
        if high_risk > 3:
            quick_wins.append({
                'id': 'qw_2',
                'action': 'Launch retention intervention program',
                'estimatedImpact': f'Retain {high_risk//2} employees, ${high_risk * 25000} saved',
                'timeToImplement': '1 week',
                'owner': 'HR Director'
            })
        
        quick_wins.append({
            'id': 'qw_3',
            'action': 'Implement weekly pulse surveys',
            'estimatedImpact': 'Early warning system, +5% satisfaction',
            'timeToImplement': '2 days',
            'owner': 'HR Team'
        })
        
        # Calculate trend (mock)
        trend = random.choice([-5, -3, -1, 1, 3, 5])
        trend_direction = 'up' if trend > 0 else 'down' if trend < 0 else 'stable'
        
        summary = {
            'overallHealth': {
                'score': int(avg_sentiment),
                'trend': trend,
                'trendDirection': trend_direction
            },
            'costAtRisk': {
                'amount': int(cost_at_risk),
                'breakdown': {
                    'turnoverCost': int(high_risk * turnover_cost_per_employee),
                    'productivityLoss': int((high_risk + medium_risk) * productivity_loss_per_risk),
                    'recruitmentCost': int(high_risk * recruitment_cost)
                }
            },
            'topIssues': top_issues[:4],
            'quickWins': quick_wins[:4],
            'keyMetrics': {
                'totalEmployees': total_employees,
                'avgSentiment': avg_sentiment,
                'highRiskCount': high_risk,
                'schedulingEfficiency': random.randint(75, 90),
                'learningEngagement': random.randint(65, 85)
            }
        }
        
        return {"success": True, "data": summary}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )