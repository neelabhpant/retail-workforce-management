# Backend Structure - AI-Powered Retail Workforce Management

## Clean Architecture Overview

After cleanup, the backend now has a focused, AI-first architecture with only essential files.

## Core Python Files (7 files)

### 1. **main.py** (Main Application)
- FastAPI application entry point
- WebSocket management for real-time updates
- RESTful API endpoints
- Prophet integration for forecasting
- CrewAI agent orchestration

### 2. **scheduling_agents.py** (AI-Powered Agents)
- **5 Specialized AI Agents using CrewAI with LLM reasoning:**
  - `Demand Forecaster` - Allocates store traffic to departments
  - `Staff Optimizer` - Creates optimal shift assignments
  - `Cost Analyst` - Analyzes labor costs and savings
  - `Compliance Checker` - Validates legal requirements
  - `Quality Auditor` - Evaluates overall schedule quality
- All agents use real OpenAI GPT models for reasoning
- No simulation or hardcoded logic

### 3. **prophet_forecasting.py** (Time Series Forecasting)
- Prophet model for store-wide demand forecasting
- Historical data generation for training
- 365 days of synthetic retail patterns
- Department-specific multipliers

### 4. **mock_cdp.py** (Data Platform Simulation)
- DuckDB in-memory database
- Simulates Cloudera Data Platform
- Stores employees, schedules, forecasts
- ML model training capabilities

### 5. **data_generator.py** (Test Data Generation)
- Generates realistic employee profiles
- Creates sample schedules
- Produces demand patterns
- Supports demo scenarios

### 6. **test_agents_api.py** (API Testing)
- Verifies OpenAI API connectivity
- Tests basic agent functionality
- Validates LLM responses

### 7. **test_ai_workflow.py** (Integration Testing)
- Tests complete AI workflow
- Validates Prophet → Agents → Schedule flow
- Ensures all agents work together

## Key Technologies

- **FastAPI** - Modern async web framework
- **CrewAI 0.165.1** - Multi-agent orchestration
- **Prophet** - Time series forecasting
- **DuckDB** - In-memory SQL database
- **OpenAI GPT** - LLM for agent reasoning
- **WebSockets** - Real-time agent status updates

## API Endpoints

### Scheduling (AI-Powered)
- `POST /api/agents/optimize-schedule-crewai` - Full AI optimization with 5 agents

### Prophet Forecasting
- `GET /api/prophet/status` - Prophet system status
- `POST /api/prophet/train` - Train Prophet models
- `POST /api/prophet/forecast` - Generate forecasts

### Data Access
- `GET /api/data/employees` - Employee data
- `GET /api/data/schedules` - Schedule data
- `GET /api/data/demand-forecast` - Forecast data
- `GET /api/data/retention-metrics` - Retention metrics

### Platform
- `GET /api/platform/status` - System status
- `GET /api/platform/events` - Real-time events

## Data Flow

```
1. Prophet generates store-wide forecast (7000 customers/week)
   ↓
2. Demand Forecaster Agent allocates to departments (using AI)
   - Electronics: 25%
   - Sales Floor: 45%
   - Customer Service: 30%
   ↓
3. Staff Optimizer Agent creates shifts (using AI)
   - Matches employees to departments
   - Considers availability and skills
   ↓
4. Cost Analyst evaluates financials (using AI)
   - Calculates total costs
   - Identifies savings
   ↓
5. Compliance Checker validates (using AI)
   - Checks overtime rules
   - Verifies break requirements
   ↓
6. Quality Auditor finalizes (using AI)
   - Assesses overall quality
   - Provides recommendations
```

## Environment Variables (.env)

```
ENVIRONMENT=development
DEBUG=True
DATABASE_PATH=./retail_workforce.db
OPENAI_API_KEY=sk-xxx...xxx
CORS_ORIGINS=["http://localhost:3000"]
```

## Removed Files (Cleanup Complete)

The following files were removed to maintain a clean, AI-focused codebase:
- `agents.py` - Old non-AI agent implementation
- `agents_simple.py` - Simplified version
- `scheduling_agents.py` (old) - Simulation-based agents
- `scheduling_agents_prophet.py` - Redundant variant
- `main_simple.py` - Unnecessary variant
- `main_minimal.py` - Unnecessary variant
- `main_prophet.py` - Unnecessary variant
- `main_docker.py` - Docker-specific (not needed now)

## Running the System

```bash
# Activate virtual environment
source venv/bin/activate

# Start the backend
python main.py

# Test API connectivity
python test_agents_api.py

# Test full AI workflow
python test_ai_workflow.py
```

## Future Extensions

When implementing Retention Analytics and Learning Paths:
1. Create `retention_agents.py` with specialized AI agents
2. Create `learning_agents.py` with educational AI agents
3. Keep agent groups in separate files for modularity
4. All new agents will use AI reasoning (no simulation)

## Notes

- All scheduling decisions now use real AI reasoning
- No hardcoded or simulated logic remains
- OpenAI API key required for operation
- System designed for single store with multiple departments
- WebSocket provides real-time agent progress updates