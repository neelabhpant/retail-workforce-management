# Retail Workforce Management System

Retail workforce management platform built on Cloudera Data Platform (CDP). Uses simulated CDP infrastructure (NiFi, Kafka, Spark, CML) with real AI agents for scheduling, retention, sentiment analysis, and learning paths.

## Setup

### Backend
```bash
cd backend
python -m venv venv
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

### Frontend
```bash
cd frontend
npm install
npm start
```

App runs at `http://localhost:3000`, backend at `http://localhost:8000`.

### Docker
```bash
docker-compose up
```

## Requirements
- Python 3.11+
- Node.js 18+
- OpenAI API key
