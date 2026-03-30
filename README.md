# Retail Workforce AI Management System

A demo application showcasing Cloudera Data Platform (CDP) capabilities for AI-driven retail workforce management. Uses simulated CDP infrastructure (NiFi, Kafka, Spark, CML) with real AI agents powered by CrewAI and OpenAI for scheduling, retention analysis, sentiment analysis, and learning path generation.

## Features

### CDP Overview & Data Flow
- Real-time visualization of data flowing through simulated CDP components (NiFi, Kafka, Spark, Data Warehouse, CML)
- Data lineage tracking showing how data moves through the pipeline with per-stage metrics
- Live WebSocket-driven event simulation (clock-ins, customer interactions, inventory updates)

### Executive Summary
- Organization-wide health score with trend tracking
- Cost-at-risk analysis (turnover, productivity loss, recruitment)
- Prioritized issue identification and quick-win recommendations

### Sentiment Analysis
- Department-level sentiment heatmap with weekly trends
- AI-powered cell-level drill-down analysis using CrewAI agents
- Prioritized action queue with estimated impact
- Pulse survey generation and response tracking
- Mobile-optimized sentiment dashboard (`/mobile` route)

### Smart Scheduling
- AI-powered schedule optimization using 5 specialized CrewAI agents (demand forecasting, staff optimization, cost analysis, compliance, quality assurance)
- Prophet time-series demand forecasting with 365 days of historical data
- Hourly staffing predictions with confidence intervals
- Labor law compliance validation
- Demo scenarios: Black Friday surge, staff shortage, predictive scheduling

### Retention Analytics
- AI-driven retention risk scoring using CrewAI agents (risk analyzer, engagement monitor, career advisor, compensation analyst)
- Multi-factor risk assessment (satisfaction, overtime, tenure, performance)
- Department-level trend analysis
- Targeted intervention recommendations

### Learning Paths
- Personalized learning path generation using CrewAI agents (skills analyzer, path designer, content curator, progress monitor)
- Skills gap analysis aligned to business priorities
- Progress tracking per employee and module

## Architecture

```
Frontend (React/TypeScript)          Backend (Python/FastAPI)
========================          ========================
App.tsx                           main.py (FastAPI + WebSocket)
  +-- DataFlowVisualizer            +-- mock_cdp.py (DuckDB, sklearn)
  +-- DataLineageTracker            +-- scheduling_agents.py (CrewAI)
  +-- ExecutiveSummary              +-- retention_agents.py (CrewAI)
  +-- SentimentDashboard            +-- sentiment_agents.py (CrewAI)
  +-- SchedulingDashboard           +-- learning_agents.py (CrewAI)
  +-- RetentionAnalytics            +-- prophet_forecasting.py (Prophet)
  +-- LearningPathway               +-- data_generator.py (Faker)
  +-- MobileSentimentDashboard
                                  Simulated CDP Components:
API: services/api.ts                NiFi, Kafka, Spark, CML,
  (axios + native WebSocket)        Data Warehouse (DuckDB)
```

## Prerequisites

- Python 3.11+
- Node.js 18+
- OpenAI API key (for CrewAI agents)

## Setup

### Quick Start
```bash
./dev-setup.sh
```

### Manual Setup

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:
```
ENVIRONMENT=development
DEBUG=True
DATABASE_PATH=./retail_workforce.db
OPENAI_API_KEY=your_key_here
CORS_ORIGINS=["http://localhost:3000"]
```

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

Frontend runs at `http://localhost:5176`, backend at `http://localhost:8000`. API docs at `http://localhost:8000/docs`.

### Docker
```bash
docker-compose up
```

Frontend at `http://localhost:3000`, backend at `http://localhost:8000`.

## API Endpoints

| Group | Endpoint | Description |
|-------|----------|-------------|
| Platform | `GET /api/platform/status` | CDP platform health |
| Platform | `GET /api/platform/events` | Recent platform events |
| Data | `GET /api/data/employees` | Employee records |
| Data | `GET /api/data/schedules` | Schedule data |
| Data | `GET /api/data/demand-forecast` | Demand forecast data |
| Data | `GET /api/data/retention-metrics` | Retention risk metrics |
| Scheduling | `POST /api/agents/optimize-schedule-crewai` | AI schedule optimization |
| Retention | `POST /api/agents/analyze-retention` | AI retention analysis |
| Learning | `POST /api/agents/create-learning-path` | AI learning path creation |
| Sentiment | `POST /api/sentiment/analyze` | Employee sentiment analysis |
| Sentiment | `GET /api/sentiment/heatmap` | Department sentiment heatmap |
| Sentiment | `GET /api/sentiment/action-queue` | Prioritized action items |
| Sentiment | `GET /api/sentiment/executive-summary` | Executive metrics |
| Prophet | `GET /api/prophet/status` | Prophet model status |
| Prophet | `POST /api/prophet/forecast` | Generate demand forecast |
| Prophet | `GET /api/prophet/insights` | Forecast insights |
| Lineage | `POST /api/lineage/track` | Track data through CDP pipeline |
| Demo | `POST /api/demo/scenario` | Run demo scenario |
| WebSocket | `ws://localhost:8000/ws` | Real-time event stream |

## Demo Scenarios

Trigger via the UI or API (`POST /api/demo/scenario`):

1. **Black Friday Preparation** (`black_friday`) - Simulates customer surge detection, demand forecasting, staff reallocation, and compliance checks
2. **Staff Shortage Response** (`staff_shortage`) - Simulates call-outs, coverage gap analysis, cross-trained staff identification, and schedule optimization
3. **Predictive Scheduling** (`predictive_scheduling`) - Demonstrates historical data analysis, ML model retraining, optimal schedule generation, and compliance validation

## Tech Stack

**Backend:** FastAPI, CrewAI, OpenAI, Prophet, DuckDB, scikit-learn, pandas, Faker

**Frontend:** React 18, TypeScript, Tailwind CSS, D3.js, Framer Motion, Recharts, Axios, Lucide Icons

## Testing

```bash
cd backend
python -m pytest
```

Test files: `test_agents_api.py`, `test_ai_workflow.py`, `test_retention_workflow.py`, `test_learning_workflow.py`
