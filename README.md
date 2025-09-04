# Retail Workforce Management Demo Application

A comprehensive demo application showcasing Cloudera Data Platform (CDP) capabilities for AI-driven retail workforce management. This sales demo tool simulates CDP components without requiring actual Cloudera infrastructure.

## 🎯 Purpose

This demo application demonstrates how Cloudera CDP can power intelligent workforce management in retail environments by showcasing:

- **Real-time Data Processing**: Live data flow through simulated CDP components
- **AI-Driven Analytics**: Machine learning models for predictions and optimization  
- **Interactive Dashboards**: Modern UI for workforce management workflows
- **Agent-Based AI**: CrewAI agents for complex workforce decisions

## 🏗️ Architecture

### Backend (Python/FastAPI)
- **Framework**: FastAPI with async WebSocket support
- **AI Agents**: CrewAI framework for orchestrating specialized agents
- **Mock Services**: Simulated CDP components using DuckDB, scikit-learn, and asyncio
- **Real-time**: WebSocket connections for live data streaming

### Frontend (React/TypeScript)  
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom CDP theming
- **Visualizations**: D3.js and Framer Motion for animated data flows
- **Charts**: Recharts for analytics dashboards

### Mock CDP Components
- **Data Warehouse**: DuckDB-based workforce data storage
- **ML Platform**: Scikit-learn models for predictions
- **DataFlow**: AsyncIO queues simulating Kafka streams
- **AI Agents**: CrewAI agents for workforce optimization

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Using Local Development (Recommended)

The easiest way to run the demo is using local development:

```bash
# Run the setup script
./dev-setup.sh

# Start backend (Terminal 1)
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Start frontend (Terminal 2)  
cd frontend
npm start

# Access the application at http://localhost:3000
```

### Using Docker (Alternative)

```bash
# For a simplified Docker deployment
docker-compose up backend -d

# The backend will be available at http://localhost:8000
# Frontend can be run locally as above
```

### Local Development

#### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# The app will open at http://localhost:3000
```

## 📊 Features

### 1. CDP Data Flow Visualizer
- Real-time animated data particle flow between CDP components
- Live component status monitoring (idle/active/processing/error)
- Interactive demo scenario triggers
- System event log with timestamps

### 2. AI-Powered Scheduling
- Demand forecasting with ML predictions
- Schedule optimization considering employee preferences
- Cost analysis and coverage metrics
- Automated shift generation with confidence scores

### 3. Employee Retention Analytics
- Risk score calculations using multiple factors
- Department-level retention trends
- Individual employee risk profiles
- AI-recommended intervention strategies

### 4. Learning & Development Pathways
- Personalized learning path creation
- Skills gap analysis with radar charts
- Career progression tracking
- Module recommendations based on performance

### 5. Platform Metrics Dashboard
- Real-time system health monitoring
- Resource utilization tracking
- Component status indicators
- Performance insights and alerts

## 🎭 Demo Scenarios

The application includes three automated demo scenarios:

### Black Friday Preparation
Demonstrates peak season workforce planning with:
- Traffic surge predictions (300% increase)
- Additional staffing requirements (45+ extra staff)
- Extended hours scheduling
- Department-specific adjustments

### Employee Retention Intervention  
Shows proactive retention management:
- High-risk employee identification (85% risk score)
- Personalized intervention plans
- Manager meeting scheduling
- Success probability predictions

### Career Development Journey
Illustrates employee growth tracking:
- Multi-stage career progression
- Skill acquisition milestones
- Learning module completion
- Performance improvement tracking

## 🛠️ API Endpoints

### Platform Management
- `GET /api/platform/status` - Overall platform health
- `GET /api/platform/events` - Recent system events

### Data Access
- `GET /api/data/employees` - Employee information
- `GET /api/data/schedules` - Schedule data
- `GET /api/data/demand-forecast` - Customer demand predictions
- `GET /api/data/retention-metrics` - Employee retention data

### AI Agent Operations
- `POST /api/agents/optimize-schedule` - Schedule optimization
- `POST /api/agents/analyze-retention` - Retention analysis
- `POST /api/agents/create-learning-path` - Learning path generation
- `POST /api/agents/forecast-demand` - Demand forecasting

### Demo Controls
- `POST /api/demo/scenario` - Execute demo scenarios
- `POST /api/data/generate` - Generate sample data

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```
ENVIRONMENT=development
DEBUG=True
DATABASE_PATH=./retail_workforce.db
OPENAI_API_KEY=your_openai_api_key_here
CORS_ORIGINS=["http://localhost:3000"]
```

**Frontend**
```
REACT_APP_API_URL=http://localhost:8000
NODE_ENV=development
```

### Docker Configuration
- Backend runs on port 8000
- Frontend runs on port 3000
- Optional Nginx reverse proxy on port 80
- Persistent data storage with Docker volumes

## 🎨 Customization

### Adding New Demo Scenarios
1. Add scenario data generation in `backend/data_generator.py`
2. Implement scenario logic in `backend/main.py`
3. Add UI triggers in `frontend/src/components/DataFlowVisualizer.tsx`

### Extending AI Agents
1. Create new agent in `backend/agents.py` 
2. Add corresponding API endpoint
3. Update frontend service calls in `frontend/src/services/api.ts`

### Modifying Data Models
1. Update database schema in `backend/mock_cdp.py`
2. Adjust TypeScript interfaces in `frontend/src/services/api.ts`
3. Regenerate sample data in `backend/data_generator.py`

## 📈 Performance

- **Backend**: Handles 100+ concurrent WebSocket connections
- **Database**: In-memory DuckDB for fast queries
- **Frontend**: Optimized React components with lazy loading
- **Real-time**: Sub-second WebSocket message delivery

## 🔒 Security

- CORS protection for cross-origin requests
- Input validation on all API endpoints
- Docker containers run as non-root users
- Environment variable protection for sensitive data

## 🐛 Troubleshooting

### Common Issues

**Connection Errors**
```bash
# Check if backend is running
curl http://localhost:8000/api/platform/status

# Verify WebSocket connection
docker-compose logs backend | grep WebSocket
```

**Build Failures**  
```bash
# Clean Docker cache
docker system prune -a

# Rebuild containers
docker-compose up --build
```

**Data Issues**
```bash
# Reset demo data
curl -X POST http://localhost:8000/api/data/generate?data_type=all&count=50
```

## 📝 License

This demo application is created for Cloudera sales demonstrations. Please ensure compliance with your organization's policies when using or distributing this code.

## 🤝 Contributing

This is a demo application. For enhancements or issues, please contact the development team or create an issue in the repository.

## 📞 Support

For technical support or demo assistance:
- Check the troubleshooting section above
- Review Docker logs: `docker-compose logs -f`
- Verify all services are healthy: `docker-compose ps`

---

**Built with 💙 for Cloudera Data Platform demonstrations**