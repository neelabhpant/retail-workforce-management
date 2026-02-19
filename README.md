# Retail Workforce Management System

AI-driven retail workforce management platform built on Cloudera Data Platform (CDP). Simulates full CDP infrastructure — data ingestion, streaming, ML, and AI agents — without requiring actual Cloudera services.

## Architecture

**Backend** — Python/FastAPI with WebSocket support, CrewAI agents (OpenAI GPT), Prophet forecasting, DuckDB in-memory database, scikit-learn ML models

**Frontend** — React 18 + TypeScript, Tailwind CSS, D3.js, Framer Motion, Recharts

## Features

| Tab | Description |
|---|---|
| **CDP Overview** | Real-time data flow visualization through simulated CDP components (NiFi, Kafka, Spark, CML) with data lineage tracking |
| **Executive Summary** | High-level sentiment metrics, cost-at-risk analysis, top issues, and quick wins for leadership |
| **Sentiment Analysis** | Department sentiment heatmap, AI-powered cell analysis, prioritized action queue |
| **Smart Scheduling** | CrewAI agent-based schedule optimization with Prophet demand forecasting |
| **Retention Analytics** | Employee retention risk scoring with AI-recommended interventions |
| **Learning Paths** | Personalized career development pathways with skills gap analysis |

**Demo Scenarios**: Black Friday surge, staff shortage response, predictive scheduling — all animated through WebSocket events.

**Mobile**: Dedicated mobile sentiment dashboard at `/mobile`.

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- OpenAI API key (for CrewAI agents)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
ENVIRONMENT=development
DEBUG=True
DATABASE_PATH=./retail_workforce.db
OPENAI_API_KEY=your_key_here
CORS_ORIGINS=["http://localhost:3000"]
EOF

uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm start
# Opens at http://localhost:3000
```

### Docker (Alternative)
```bash
docker-compose up
```

## API Endpoints

### Data
- `GET /api/platform/status` — Platform health
- `GET /api/data/employees` — Employee data
- `GET /api/data/schedules` — Schedule data
- `GET /api/data/retention-metrics` — Retention risk data

### AI Agents
- `POST /api/agents/optimize-schedule-crewai` — AI schedule optimization (CrewAI + Prophet)
- `POST /api/agents/analyze-retention` — Retention risk analysis
- `POST /api/agents/create-learning-path` — Learning path generation

### Sentiment
- `GET /api/sentiment/heatmap` — Department sentiment heatmap
- `GET /api/sentiment/action-queue` — Prioritized action items
- `GET /api/sentiment/executive-summary` — Executive metrics
- `POST /api/sentiment/analyze-cell` — AI analysis of specific heatmap cell
- `POST /api/sentiment/pulse-survey` — Generate pulse surveys

### Prophet Forecasting
- `GET /api/prophet/status` — Model status
- `POST /api/prophet/forecast` — Generate demand forecast
- `POST /api/prophet/train` — Train models
- `GET /api/prophet/insights` — Forecast insights

### Data Lineage
- `POST /api/lineage/track` — Track data through CDP pipeline
- `GET /api/lineage/stage/{component}/{tracking_id}` — Stage details

### Demo
- `POST /api/demo/scenario` — Run demo scenario (`black_friday`, `staff_shortage`, `predictive_scheduling`)

### WebSocket
- `ws://localhost:8000/ws` — Real-time events (`system_status`, `data_flow_event`, `lineage_tracking`, `sentiment_update`)

## Tech Stack

| Layer | Technology |
|---|---|
| API | FastAPI, WebSocket |
| AI Agents | CrewAI, OpenAI GPT |
| Forecasting | Facebook Prophet |
| Database | DuckDB (in-memory) |
| ML | scikit-learn, pandas, numpy |
| Frontend | React 18, TypeScript |
| Styling | Tailwind CSS |
| Visualization | D3.js, Framer Motion, Recharts |
| HTTP | Axios |

## Project Structure

```
backend/
  main.py                 # FastAPI app with all endpoints
  mock_cdp.py             # Simulated CDP services (DuckDB, ML, DataFlow)
  scheduling_agents.py    # CrewAI scheduling optimization agents
  retention_agents.py     # CrewAI retention analysis agents
  sentiment_agents.py     # CrewAI sentiment analysis agents
  learning_agents.py      # CrewAI learning path agents
  prophet_forecasting.py  # Prophet demand forecasting
  data_generator.py       # Sample data generation

frontend/src/
  App.tsx                 # Main app with tab navigation
  services/api.ts         # REST + WebSocket client
  components/
    DataFlowVisualizer    # CDP data flow animation
    DataLineageTracker    # Data lineage tracking
    ExecutiveSummary      # Executive dashboard
    SentimentDashboard    # Sentiment heatmap + actions
    SchedulingDashboard   # Schedule optimization
    RetentionAnalytics    # Retention risk analysis
    LearningPathway       # Career development paths
    LandingSequence       # Animated intro sequence
    mobile/               # Mobile-optimized views
```
