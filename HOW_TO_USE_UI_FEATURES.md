# How to Use Retention Analytics & Learning Paths in the UI

## Prerequisites
1. **Backend Running**: Ensure the backend is running with the OpenAI API key configured
   ```bash
   cd backend
   source venv/bin/activate
   python main.py
   ```

2. **Frontend Running**: Ensure the frontend is running
   ```bash
   cd frontend
   npm start
   ```

## Accessing the Features

### 1. Navigate to the Application
Open your browser and go to: `http://localhost:3000` or `http://localhost:3001`

### 2. Main Navigation Tabs
The application has 4 main tabs at the top:
- **CDP Overview**: System overview and data flow visualization
- **Smart Scheduling**: AI-powered workforce scheduling
- **Retention Analytics**: Employee retention risk analysis (NEW)
- **Learning Paths**: Personalized employee learning paths (NEW)

## Using Retention Analytics

### Step 1: Click on "Retention Analytics" Tab
This opens the retention analytics dashboard showing:
- Total employees count
- High-risk employee count
- Average risk score
- Number of departments

### Step 2: Run AI Analysis
1. Click the **"Run Analysis"** button (blue button in top-right)
2. Wait 30-60 seconds for AI agents to analyze (you'll see a loading spinner)
3. The AI agents will:
   - Analyze retention risks for all employees
   - Identify key risk factors
   - Evaluate engagement levels
   - Review compensation competitiveness
   - Create retention strategies

### Step 3: Review Results
After analysis completes, you'll see:

#### Risk Distribution Chart
- Pie chart showing High/Medium/Low risk employee distribution
- Color-coded: Red (High), Yellow (Medium), Green (Low)

#### Department Risk Levels
- Bar chart showing average risk score by department
- Helps identify problem departments

#### Employee Risk Cards
Each employee card displays:
- Name and department
- Risk score (0-100%)
- Risk level badge (High/Medium/Low)
- Top risk factors
- Tenure in months
- Number of recommended interventions

### Step 4: Filter and Search
Use the filters to narrow down:
- **Search box**: Find specific employees by name or ID
- **Department dropdown**: Filter by department
- **Risk Level dropdown**: Show only High/Medium/Low risk employees

### Step 5: View Employee Details
Click on any employee card to see:
- Detailed risk analysis
- All identified risk factors
- Recommended interventions
- Predicted outcome with interventions
- Action buttons to schedule meetings or create action plans

### Step 6: Export Results
Click **"Export Report"** to download the full analysis (feature may need implementation)

## Using Learning Paths

### Step 1: Click on "Learning Paths" Tab
This opens the learning paths dashboard showing:
- Active learners count
- Total courses available
- Average completion rate
- Upcoming deadlines

### Step 2: Generate Learning Paths
1. Click the **"Generate Paths"** button
2. Optionally select:
   - Department filter
   - Role filter
   - Skill priorities
3. Wait for AI agents to process (30-60 seconds)

### Step 3: AI Agents Process
The AI agents will:
- Analyze skills gaps for each employee
- Design personalized learning paths
- Curate relevant content
- Create progress monitoring framework
- Develop career coaching strategies

### Step 4: View Generated Paths
After generation, you'll see:

#### Learning Progress Overview
- Visual charts showing overall progress
- Department-wise completion rates
- Popular courses

#### Individual Learning Paths
For each employee:
- Current role and target role
- Learning modules assigned
- Progress for each module
- Estimated completion time
- Next milestone

### Step 5: Track Progress
- Click on any employee to see detailed learning path
- View module-by-module progress
- See completed, in-progress, and upcoming modules
- Track certifications and achievements

### Step 6: Manage Learning Content
- Browse available courses
- Filter by skill category
- See course ratings and duration
- Assign courses to employees

## AI Agent Monitor

When running any AI-powered analysis, you'll see the **AI Agent Monitor** panel showing:
1. **Demand Forecaster** - Analyzing customer patterns
2. **Staff Optimizer** - Creating optimal schedules
3. **Cost Analyst** - Evaluating financial impact
4. **Compliance Checker** - Verifying legal requirements
5. **Quality Auditor** - Assessing overall quality

For Retention Analytics:
1. **Risk Analyzer** - Identifying at-risk employees
2. **Engagement Monitor** - Assessing satisfaction
3. **Career Advisor** - Planning development paths
4. **Compensation Analyst** - Reviewing pay equity
5. **Retention Strategist** - Creating action plans

For Learning Paths:
1. **Skills Analyzer** - Identifying gaps
2. **Path Designer** - Creating learning journeys
3. **Content Curator** - Selecting resources
4. **Progress Monitor** - Tracking completion
5. **Career Coach** - Providing guidance

## Tips for Best Results

### For Retention Analytics:
- Run analysis monthly to track trends
- Focus on high-risk employees first
- Implement interventions within 30 days
- Track outcome effectiveness

### For Learning Paths:
- Align learning with business priorities
- Set realistic completion timelines
- Encourage peer learning
- Celebrate completions

## Troubleshooting

### "Analysis taking too long"
- AI agents may take 30-60 seconds
- Check backend console for progress
- Ensure OpenAI API key is valid

### "No data showing"
- Ensure backend is running
- Check browser console for errors
- Verify API endpoints are accessible

### "Connection error"
- Check backend is running on port 8000
- Verify frontend is on port 3000/3001
- Check CORS settings in backend

## API Endpoints Reference

### Retention Analytics
- `POST /api/retention/analyze-risks` - Run full AI analysis
- `GET /api/retention/risk-scores` - Get latest risk scores
- `POST /api/retention/create-strategy` - Generate retention strategy

### Learning Paths
- `POST /api/learning/analyze-skills` - Analyze skill gaps
- `POST /api/learning/create-paths` - Generate learning paths
- `GET /api/learning/employee-paths/{id}` - Get individual path
- `POST /api/learning/track-progress` - Update progress
- `GET /api/learning/recommendations` - Get AI recommendations

## Next Steps

1. **Customize for Your Organization**:
   - Add your employee data
   - Define your skill priorities
   - Set retention thresholds

2. **Schedule Regular Analysis**:
   - Weekly scheduling optimization
   - Monthly retention analysis
   - Quarterly learning path reviews

3. **Measure Success**:
   - Track retention improvements
   - Monitor learning completion rates
   - Calculate ROI on interventions

## Support

For issues or questions:
- Check backend logs: `backend/ai_schedule_*.json`
- Review frontend console for errors
- Ensure all dependencies are installed
- Verify OpenAI API key is active and has credits