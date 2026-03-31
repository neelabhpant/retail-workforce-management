# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Retail Workforce AI Management System that showcases Cloudera Data Platform (CDP) capabilities for AI-driven retail workforce management. It's a sales demo tool that simulates CDP components (NiFi, Kafka, Spark, CML, Data Warehouse) without requiring actual Cloudera infrastructure, using real AI agents powered by CrewAI and OpenAI.

## Architecture

### Backend (Python/FastAPI)
- **Main entry**: `backend/main.py` (FastAPI app with WebSocket support, default port 8002)
- **AI Agents** (all use CrewAI framework with OpenAI):
  - `scheduling_agents.py` - 5 agents: demand forecasting, staff optimization, cost analysis, compliance, quality assurance
  - `retention_agents.py` - 4 agents: risk analyzer, engagement monitor, career advisor, compensation analyst
  - `learning_agents.py` - 4 agents: skills analyzer, path designer, content curator, progress monitor
  - `sentiment_agents.py` - 4 agents: sentiment collector, communication analyzer, survey interpreter, behavioral analyst
- **Mock CDP Components**: `mock_cdp.py` simulates CDP services using DuckDB (in-memory), scikit-learn (RandomForest models), and asyncio
- **Data Generation**: `data_generator.py` creates sample retail workforce data using Faker
- **Forecasting**: `prophet_forecasting.py` for Prophet time-series demand predictions with Plotly visualizations

### Frontend (React/TypeScript)
- **Main entry**: `frontend/src/App.tsx`
- **Component architecture**:
  - `LandingSequence` - Animated intro sequence (shown once per session)
  - `DataFlowVisualizer` - Real-time CDP component data flow visualization
  - `DataLineageTracker` - Data lineage tracking through CDP pipeline
  - `ExecutiveSummary` - Organization health, cost-at-risk, quick wins
  - `SentimentDashboard` - Department heatmap, action queue, AI cell analysis
  - `SchedulingDashboard` - AI schedule optimization with Prophet forecasts
  - `RetentionAnalytics` - Risk scoring and intervention recommendations
  - `LearningPathway` - Personalized learning paths and progress tracking
  - `PlatformMetrics` - CDP platform health metrics
  - `AgentMonitor` - AI agent activity monitoring
  - `MobileSentimentDashboard` - Mobile-optimized sentiment view (route: `/mobile`)
- **API Service**: `frontend/src/services/api.ts` uses axios (with separate AI client for long-running ops, 10min timeout) and native WebSocket
- **Styling**: Tailwind CSS with custom CDP theming (`cdp-blue`, `cdp-green`)
- **Visualizations**: D3.js, Framer Motion, and Recharts

## Common Development Commands

### Setup
```bash
./dev-setup.sh
```

### Backend Development
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development
```bash
cd frontend
npm install
npm start    # Runs on port 5176
npm run build
npm test
```

### Docker Deployment
```bash
docker-compose up backend -d  # Start backend only
docker-compose up             # Start all services (frontend on port 3000, backend on port 8000)
docker-compose down
```

## API Structure

### Main API Endpoints
- Platform management: `/api/platform/status`, `/api/platform/events`
- Data access: `/api/data/employees`, `/api/data/schedules`, `/api/data/demand-forecast`, `/api/data/retention-metrics`
- AI scheduling: `/api/agents/optimize-schedule-crewai`
- AI retention: `/api/agents/analyze-retention`, `/api/retention/analyze-risks`, `/api/retention/create-strategy`
- AI learning: `/api/agents/create-learning-path`, `/api/learning/analyze-skills`, `/api/learning/create-paths`, `/api/learning/employee-paths/{id}`, `/api/learning/track-progress`
- Sentiment analysis: `/api/sentiment/analyze`, `/api/sentiment/analyze-cell`, `/api/sentiment/heatmap`, `/api/sentiment/action-queue`, `/api/sentiment/executive-summary`, `/api/sentiment/trends/{id}`, `/api/sentiment/pulse-survey`
- Prophet forecasting: `/api/prophet/status`, `/api/prophet/train`, `/api/prophet/forecast`, `/api/prophet/visualize`, `/api/prophet/insights`, `/api/prophet/export/{dept}`
- Data lineage: `/api/lineage/track`, `/api/lineage/stage/{component}/{tracking_id}`
- Demo scenarios: `/api/demo/scenario`
- Data generation: `/api/data/generate`
- ML predictions: `/api/ml/predict-retention`, `/api/ml/forecast-customer-demand`
- WebSocket: `/ws`

### Key WebSocket Events
- `system_status` - Platform health updates (every 30s)
- `data_flow_event` - Simulated CDP data flow events (every 5s)
- `lineage_tracking` - Data lineage tracking progress
- `demo_complete` - Demo scenario completion
- `pulse_survey_available` - New pulse survey broadcast
- `sentiment_update` - Real-time sentiment score update
- `connection_status` - Initial connection confirmation
- `pong` - Keepalive response

## Environment Configuration

### Backend (.env)
```
ENVIRONMENT=development
DEBUG=True
DATABASE_PATH=./retail_workforce.db
OPENAI_API_KEY=your_openai_api_key_here
CORS_ORIGINS=["http://localhost:5176", "http://localhost:3000"]
```

### Frontend
The frontend uses `REACT_APP_API_URL` environment variable, defaulting to `http://localhost:8002`.

## Testing Approach

Backend tests are in `backend/test_*.py` files:
- `test_agents_api.py` - API endpoint tests
- `test_ai_workflow.py` - AI workflow integration
- `test_retention_workflow.py` - Retention analysis tests
- `test_learning_workflow.py` - Learning path tests
- `test_timeout_fix.py` - Timeout handling tests

Run backend tests:
```bash
cd backend
python -m pytest
```

## Key Dependencies

### Backend
- FastAPI with WebSocket support
- CrewAI for AI agent orchestration (uses OpenAI GPT)
- Prophet for time-series demand forecasting
- DuckDB for in-memory database
- scikit-learn for ML models (RandomForest)
- pandas/numpy for data processing
- Plotly for forecast visualization
- Faker for realistic sample data generation

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- D3.js and Framer Motion for animations
- Recharts for charts
- axios for HTTP requests (two clients: standard 30s timeout, AI 10min timeout)
- Native WebSocket (not socket.io)
- lucide-react for icons
- date-fns for date utilities

## Demo Scenarios

The application includes three demo scenarios triggered via the UI or `POST /api/demo/scenario`:
1. **Black Friday Preparation** (`black_friday`) - Customer surge detection, demand forecasting, staff reallocation, compliance checks
2. **Staff Shortage Response** (`staff_shortage`) - Call-out handling, coverage gap analysis, cross-trained staff identification, schedule optimization
3. **Predictive Scheduling** (`predictive_scheduling`) - Historical data analysis, ML model retraining, optimal schedule generation, compliance validation

These broadcast real-time events via WebSocket with 2-2.5 second intervals between steps.

## Important Notes

- CrewAI agent operations are long-running (5 agents x ~90s each = up to 8 min for scheduling). The backend has a 480s timeout for these operations.
- The frontend has a separate `aiApiClient` with 600s timeout for AI endpoints.
- On startup, the backend auto-generates 50 employees, 2 weeks of schedules, 30 days of demand data, and trains Prophet models for 3 departments.
- The mobile route (`/mobile`) renders `MobileSentimentDashboard` directly, bypassing the main app shell.
# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
