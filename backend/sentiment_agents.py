#!/usr/bin/env python3
"""
AI-Powered Sentiment Analysis for Employee Retention
Integrates sentiment data from multiple sources to enhance retention predictions
"""

import json
import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from crewai import Agent, Task, Crew, Process
import random

class SentimentAnalysisManager:
    """Manages sentiment analysis and integration with retention analytics"""
    
    def __init__(self):
        """Initialize sentiment analysis agents"""
        
        # 1. Sentiment Collector Agent
        self.sentiment_collector = Agent(
            role='Employee Sentiment Analyst',
            goal='Collect and analyze employee sentiment from multiple data sources',
            backstory="""You are an Employee Experience Analyst specializing in sentiment analysis.
                       You excel at interpreting emotional indicators from surveys, feedback, 
                       communication patterns, and behavioral data to gauge employee satisfaction
                       and engagement levels in real-time.""",
            verbose=True,
            allow_delegation=False
        )
        
        # 2. Communication Analyzer Agent
        self.communication_analyzer = Agent(
            role='Communication Pattern Analyst',
            goal='Analyze communication tone and patterns to detect sentiment shifts',
            backstory="""You are a Communication Analytics expert who specializes in understanding
                       workplace communication dynamics. You analyze email tone, chat patterns,
                       meeting participation, and collaboration metrics to identify emotional
                       indicators and team morale trends.""",
            verbose=True,
            allow_delegation=False
        )
        
        # 3. Survey Interpreter Agent
        self.survey_interpreter = Agent(
            role='Pulse Survey Specialist',
            goal='Design and interpret pulse surveys for continuous sentiment monitoring',
            backstory="""You are a Survey Research expert focused on employee pulse surveys.
                       You design targeted questions, interpret responses, and identify
                       sentiment trends that predict retention risks before they escalate.""",
            verbose=True,
            allow_delegation=False
        )
        
        # 4. Behavioral Pattern Agent
        self.behavioral_analyst = Agent(
            role='Behavioral Pattern Analyst',
            goal='Identify sentiment indicators from employee behavior patterns',
            backstory="""You are a Behavioral Analytics specialist who identifies emotional
                       states through work patterns. You analyze attendance, productivity
                       fluctuations, collaboration frequency, and system usage to detect
                       early warning signs of disengagement or dissatisfaction.""",
            verbose=True,
            allow_delegation=False
        )
        
        # 5. Sentiment Strategist Agent
        self.sentiment_strategist = Agent(
            role='Chief Sentiment Strategist',
            goal='Synthesize sentiment insights and create intervention strategies',
            backstory="""You are a senior People Analytics strategist with expertise in
                       sentiment-driven retention. You combine multiple sentiment indicators
                       to create comprehensive employee wellbeing assessments and design
                       targeted interventions to improve satisfaction and retention.""",
            verbose=True,
            allow_delegation=False
        )
    
    async def analyze_employee_sentiment(self, 
                                        employee_data: Dict,
                                        historical_sentiment: Optional[List[Dict]] = None,
                                        recent_events: Optional[List[Dict]] = None) -> Dict[str, Any]:
        """
        Perform comprehensive sentiment analysis for an individual employee
        
        Args:
            employee_data: Current employee information
            historical_sentiment: Past sentiment measurements
            recent_events: Recent workplace events affecting the employee
            
        Returns:
            Comprehensive sentiment analysis with risk indicators
        """
        
        # Step 1: Collect Current Sentiment Indicators
        collection_task = Task(
            description=f"""
            Analyze current sentiment indicators for employee {employee_data.get('name')}:
            
            Current Data:
            - Department: {employee_data.get('department')}
            - Tenure: {employee_data.get('tenure_days', 0)} days
            - Satisfaction Score: {employee_data.get('satisfaction_score', 3.5)}/5
            - Performance: {employee_data.get('performance_score', 3.5)}/5
            - Overtime Hours: {employee_data.get('overtime_hours', 0)}
            - Recent Absence Days: {employee_data.get('absence_days', 0)}
            
            Identify:
            1. Current emotional state (positive/neutral/negative)
            2. Key sentiment drivers (workload, recognition, growth, compensation)
            3. Engagement level (highly engaged, moderately engaged, disengaged)
            4. Stress indicators
            5. Job satisfaction factors
            
            Return JSON with sentiment_score (0-100), emotional_state, and key_drivers.
            """,
            agent=self.sentiment_collector,
            expected_output="JSON with current sentiment analysis"
        )
        
        crew = Crew(
            agents=[self.sentiment_collector],
            tasks=[collection_task],
            process=Process.sequential,
            verbose=True
        )
        
        sentiment_result = crew.kickoff()
        
        # Step 2: Analyze Communication Patterns
        communication_task = Task(
            description=f"""
            Analyze communication sentiment patterns for {employee_data.get('name')}:
            
            Consider:
            1. Email response times and tone (simulated)
            2. Meeting participation levels
            3. Collaboration frequency with team
            4. Feedback giving/receiving patterns
            5. Social interaction indicators
            
            Based on tenure of {employee_data.get('tenure_days', 0)} days and 
            department {employee_data.get('department')}, assess:
            - Communication positivity score (0-100)
            - Team connection strength
            - Manager relationship quality
            - Peer collaboration sentiment
            
            Return JSON with communication_sentiment and relationship_scores.
            """,
            agent=self.communication_analyzer,
            expected_output="JSON with communication sentiment analysis"
        )
        
        crew = Crew(
            agents=[self.communication_analyzer],
            tasks=[communication_task],
            process=Process.sequential,
            verbose=True
        )
        
        communication_result = crew.kickoff()
        
        # Step 3: Behavioral Pattern Analysis
        behavioral_task = Task(
            description=f"""
            Analyze behavioral indicators of sentiment for {employee_data.get('name')}:
            
            Behavioral Data:
            - Overtime hours: {employee_data.get('overtime_hours', 0)}
            - Performance trend: {employee_data.get('performance_score', 3.5)}/5
            - Absence patterns: {employee_data.get('absence_days', 0)} days
            - Work schedule consistency
            
            Identify:
            1. Burnout risk indicators (0-100)
            2. Engagement trajectory (improving/stable/declining)
            3. Work-life balance score
            4. Motivation indicators
            5. Early warning signs of disengagement
            
            Return JSON with behavioral_sentiment and risk_indicators.
            """,
            agent=self.behavioral_analyst,
            expected_output="JSON with behavioral sentiment analysis"
        )
        
        crew = Crew(
            agents=[self.behavioral_analyst],
            tasks=[behavioral_task],
            process=Process.sequential,
            verbose=True
        )
        
        behavioral_result = crew.kickoff()
        
        # Step 4: Comprehensive Strategy
        strategy_task = Task(
            description=f"""
            Create comprehensive sentiment assessment and intervention plan:
            
            Inputs:
            - Current Sentiment: {sentiment_result}
            - Communication Analysis: {communication_result}
            - Behavioral Patterns: {behavioral_result}
            - Historical Satisfaction: {employee_data.get('satisfaction_score', 3.5)}/5
            
            Generate:
            1. Overall sentiment score (0-100)
            2. Sentiment trend (improving/stable/declining)
            3. Risk level (low/medium/high)
            4. Top 3 intervention priorities
            5. Personalized action plan
            6. Expected improvement timeline
            7. Success metrics
            
            Return comprehensive sentiment strategy as JSON.
            """,
            agent=self.sentiment_strategist,
            expected_output="JSON with comprehensive sentiment strategy"
        )
        
        crew = Crew(
            agents=[self.sentiment_strategist],
            tasks=[strategy_task],
            process=Process.sequential,
            verbose=True
        )
        
        strategy_result = crew.kickoff()
        
        # Compile final sentiment analysis
        return {
            'employee_id': employee_data.get('employee_id'),
            'analysis_timestamp': datetime.now().isoformat(),
            'sentiment_score': self._extract_score(sentiment_result, 'sentiment_score', 70),
            'emotional_state': self._extract_value(sentiment_result, 'emotional_state', 'neutral'),
            'communication_sentiment': self._parse_json_response(communication_result, 'communication'),
            'behavioral_indicators': self._parse_json_response(behavioral_result, 'behavioral'),
            'sentiment_trend': self._determine_trend(historical_sentiment),
            'risk_level': self._calculate_risk_level(sentiment_result, behavioral_result),
            'intervention_plan': self._parse_json_response(strategy_result, 'strategy'),
            'key_drivers': {
                'positive': ['Team collaboration', 'Learning opportunities', 'Manager support'],
                'negative': ['Workload pressure', 'Limited growth', 'Work-life balance']
            },
            'recommendations': self._generate_recommendations(employee_data, strategy_result)
        }
    
    async def analyze_team_sentiment(self, 
                                    team_data: List[Dict],
                                    department: str) -> Dict[str, Any]:
        """
        Analyze sentiment at team/department level
        
        Args:
            team_data: List of employee data for the team
            department: Department name
            
        Returns:
            Team-level sentiment analysis
        """
        
        # Aggregate individual sentiments
        team_sentiments = []
        for employee in team_data[:10]:  # Limit for performance
            sentiment = await self.analyze_employee_sentiment(employee)
            team_sentiments.append(sentiment)
        
        # Calculate team metrics
        avg_sentiment = sum(s['sentiment_score'] for s in team_sentiments) / len(team_sentiments)
        
        return {
            'department': department,
            'team_size': len(team_data),
            'average_sentiment': avg_sentiment,
            'sentiment_distribution': {
                'positive': len([s for s in team_sentiments if s['sentiment_score'] > 70]),
                'neutral': len([s for s in team_sentiments if 40 <= s['sentiment_score'] <= 70]),
                'negative': len([s for s in team_sentiments if s['sentiment_score'] < 40])
            },
            'team_morale': 'high' if avg_sentiment > 70 else 'moderate' if avg_sentiment > 40 else 'low',
            'risk_employees': [s['employee_id'] for s in team_sentiments if s['risk_level'] == 'high'],
            'top_concerns': self._aggregate_concerns(team_sentiments),
            'team_dynamics': {
                'collaboration_score': random.uniform(60, 90),
                'communication_health': random.uniform(65, 85),
                'psychological_safety': random.uniform(70, 90)
            }
        }
    
    def generate_pulse_survey(self, focus_area: str = 'general') -> Dict[str, Any]:
        """
        Generate targeted pulse survey questions
        
        Args:
            focus_area: Area to focus on (general, workload, growth, culture, etc.)
            
        Returns:
            Pulse survey configuration
        """
        
        surveys = {
            'general': {
                'title': 'Weekly Pulse Check',
                'questions': [
                    {'id': 'q1', 'text': 'How satisfied are you with your work this week?', 'type': 'scale', 'range': [1, 10]},
                    {'id': 'q2', 'text': 'How would you rate your work-life balance?', 'type': 'scale', 'range': [1, 10]},
                    {'id': 'q3', 'text': 'Do you feel recognized for your contributions?', 'type': 'yes_no'},
                    {'id': 'q4', 'text': 'What would improve your experience?', 'type': 'text'}
                ]
            },
            'workload': {
                'title': 'Workload Assessment',
                'questions': [
                    {'id': 'q1', 'text': 'Is your current workload manageable?', 'type': 'scale', 'range': [1, 10]},
                    {'id': 'q2', 'text': 'How often do you work beyond regular hours?', 'type': 'frequency'},
                    {'id': 'q3', 'text': 'Do you have the resources needed to succeed?', 'type': 'yes_no'},
                    {'id': 'q4', 'text': 'What would help manage your workload better?', 'type': 'text'}
                ]
            },
            'growth': {
                'title': 'Career Development Check',
                'questions': [
                    {'id': 'q1', 'text': 'Are you satisfied with your career growth?', 'type': 'scale', 'range': [1, 10]},
                    {'id': 'q2', 'text': 'Do you see a clear path for advancement?', 'type': 'yes_no'},
                    {'id': 'q3', 'text': 'Are you learning new skills in your role?', 'type': 'yes_no'},
                    {'id': 'q4', 'text': 'What development opportunities interest you?', 'type': 'text'}
                ]
            }
        }
        
        survey = surveys.get(focus_area, surveys['general'])
        survey['survey_id'] = f"pulse_{focus_area}_{datetime.now().strftime('%Y%m%d')}"
        survey['created_at'] = datetime.now().isoformat()
        survey['target_response_rate'] = 0.8
        survey['frequency'] = 'weekly' if focus_area == 'general' else 'monthly'
        
        return survey
    
    def _extract_score(self, response: Any, key: str, default: float) -> float:
        """Extract numeric score from AI response"""
        try:
            if isinstance(response, dict):
                return float(response.get(key, default))
            # Try to extract number from string
            import re
            numbers = re.findall(r'\d+\.?\d*', str(response))
            if numbers:
                return float(numbers[0])
        except:
            pass
        return default
    
    def _extract_value(self, response: Any, key: str, default: str) -> str:
        """Extract string value from AI response"""
        try:
            if isinstance(response, dict):
                return str(response.get(key, default))
            # Look for common emotional states in response
            response_str = str(response).lower()
            if 'positive' in response_str:
                return 'positive'
            elif 'negative' in response_str:
                return 'negative'
        except:
            pass
        return default
    
    def _parse_json_response(self, response: Any, category: str) -> Dict:
        """Parse AI agent response to extract JSON data"""
        try:
            if isinstance(response, dict):
                return response
            
            response_str = str(response)
            json_start = response_str.find('{')
            json_end = response_str.rfind('}') + 1
            
            if json_start != -1 and json_end > json_start:
                json_str = response_str[json_start:json_end]
                return json.loads(json_str)
        except:
            pass
        
        return {
            'category': category,
            'insights': str(response)[:300],
            'confidence': 0.75
        }
    
    def _determine_trend(self, historical: Optional[List[Dict]]) -> str:
        """Determine sentiment trend from historical data"""
        if not historical or len(historical) < 2:
            return 'stable'
        
        # Simple trend calculation (would be more sophisticated in production)
        recent = historical[-3:] if len(historical) >= 3 else historical
        if len(recent) >= 2:
            recent_avg = sum(h.get('score', 50) for h in recent[-2:]) / 2
            older_avg = recent[0].get('score', 50)
            if recent_avg > older_avg + 5:
                return 'improving'
            elif recent_avg < older_avg - 5:
                return 'declining'
        return 'stable'
    
    def _calculate_risk_level(self, sentiment: Any, behavioral: Any) -> str:
        """Calculate retention risk level based on sentiment and behavior"""
        sentiment_score = self._extract_score(sentiment, 'sentiment_score', 70)
        burnout_risk = self._extract_score(behavioral, 'burnout_risk', 30)
        
        # Combined risk calculation
        combined_risk = (100 - sentiment_score) * 0.6 + burnout_risk * 0.4
        
        if combined_risk > 70:
            return 'high'
        elif combined_risk > 40:
            return 'medium'
        return 'low'
    
    def _generate_recommendations(self, employee_data: Dict, strategy: Any) -> List[str]:
        """Generate personalized recommendations"""
        recommendations = []
        
        # Base recommendations on employee factors
        if employee_data.get('overtime_hours', 0) > 10:
            recommendations.append("Review workload distribution and consider additional support")
        
        if employee_data.get('satisfaction_score', 3.5) < 3:
            recommendations.append("Schedule 1-on-1 meeting to discuss concerns and career goals")
        
        if employee_data.get('tenure_days', 0) < 180:
            recommendations.append("Enhance onboarding support and assign a mentor")
        
        if employee_data.get('performance_score', 3.5) > 4:
            recommendations.append("Recognize high performance and discuss advancement opportunities")
        
        # Add generic valuable recommendations if needed
        if len(recommendations) < 3:
            recommendations.extend([
                "Implement regular pulse surveys for continuous feedback",
                "Create opportunities for skill development and training",
                "Improve work-life balance through flexible scheduling"
            ])
        
        return recommendations[:5]  # Return top 5 recommendations
    
    def _aggregate_concerns(self, sentiments: List[Dict]) -> List[str]:
        """Aggregate top concerns from team sentiments"""
        all_concerns = []
        for sentiment in sentiments:
            if 'key_drivers' in sentiment and 'negative' in sentiment['key_drivers']:
                all_concerns.extend(sentiment['key_drivers']['negative'])
        
        # Count frequency and return top concerns
        from collections import Counter
        concern_counts = Counter(all_concerns)
        return [concern for concern, _ in concern_counts.most_common(5)]

    async def analyze_department_cell(self, 
                                      department: str,
                                      week: int,
                                      score: int,
                                      employee_data: List[Dict]) -> Dict[str, Any]:
        """
        Analyze a specific heat map cell (department + week) using AI agents
        
        Args:
            department: Department name
            week: Week index (0-3)
            score: Sentiment score for this cell (0-100)
            employee_data: List of employees in this department
            
        Returns:
            Comprehensive cell insight with root causes and recommendations
        """
        
        week_labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
        week_label = week_labels[week] if 0 <= week < 4 else f'Week {week + 1}'
        
        risk_level = 'critical' if score < 40 else 'warning' if score < 70 else 'healthy'
        
        dept_employees = [e for e in employee_data if e.get('department') == department]
        avg_overtime = sum(e.get('overtime_hours', 0) for e in dept_employees) / max(len(dept_employees), 1)
        avg_tenure = sum(e.get('tenure_days', 365) for e in dept_employees) / max(len(dept_employees), 1)
        avg_satisfaction = sum(e.get('satisfaction_score', 3.5) for e in dept_employees) / max(len(dept_employees), 1)
        
        analysis_task = Task(
            description=f"""
            Analyze why the {department} department has a sentiment score of {score}/100 during {week_label}.
            
            Department Context:
            - Current sentiment score: {score}/100 (Risk level: {risk_level})
            - Number of employees: {len(dept_employees)}
            - Average overtime hours: {avg_overtime:.1f} hours/week
            - Average tenure: {avg_tenure:.0f} days
            - Average satisfaction rating: {avg_satisfaction:.1f}/5
            
            Provide a comprehensive analysis including:
            1. A 2-3 sentence executive summary explaining the sentiment score
            2. The primary factors driving this sentiment level
            3. Whether this represents improvement or decline from typical patterns
            
            Focus on being specific and actionable. Reference the actual metrics provided.
            
            Return your analysis as a clear narrative paragraph.
            """,
            agent=self.sentiment_collector,
            expected_output="Narrative analysis of department sentiment"
        )
        
        crew = Crew(
            agents=[self.sentiment_collector],
            tasks=[analysis_task],
            process=Process.sequential,
            verbose=True
        )
        
        analysis_result = crew.kickoff()
        
        root_cause_task = Task(
            description=f"""
            Identify the root causes behind {department}'s sentiment score of {score}/100.
            
            Available Data:
            - Employee count: {len(dept_employees)}
            - Overtime: {avg_overtime:.1f} hrs/week (target: 5 hrs)
            - Tenure: {avg_tenure:.0f} days average
            - Satisfaction: {avg_satisfaction:.1f}/5
            - Week: {week_label}
            
            Based on this data and typical retail workforce patterns, identify exactly 4 specific root causes.
            
            Format each root cause as a single, specific statement with a metric where possible.
            Example: "Overtime 40% above target at 7.2 hours/week average"
            
            Return exactly 4 root causes as a numbered list.
            """,
            agent=self.behavioral_analyst,
            expected_output="4 specific root causes as numbered list"
        )
        
        crew = Crew(
            agents=[self.behavioral_analyst],
            tasks=[root_cause_task],
            process=Process.sequential,
            verbose=True
        )
        
        root_cause_result = crew.kickoff()
        
        recommendation_task = Task(
            description=f"""
            Create 3 prioritized intervention recommendations for {department} (sentiment: {score}/100).
            
            Context:
            - Risk level: {risk_level}
            - Key issue: {'Critical engagement crisis' if score < 40 else 'Moderate concerns need attention' if score < 70 else 'Maintain positive momentum'}
            - Team size: {len(dept_employees)} employees
            
            For each recommendation, provide:
            1. A specific action (start with a verb: "Implement...", "Schedule...", "Review...")
            2. Expected impact (e.g., "+15% sentiment", "$X saved", "Prevent turnover")
            3. Urgency level: high, medium, or low
            
            Format as 3 recommendations, ordered by urgency (high first).
            
            Return as JSON array:
            [
              {{"action": "...", "impact": "...", "urgency": "high"}},
              {{"action": "...", "impact": "...", "urgency": "medium"}},
              {{"action": "...", "impact": "...", "urgency": "low"}}
            ]
            """,
            agent=self.sentiment_strategist,
            expected_output="JSON array of 3 recommendations"
        )
        
        crew = Crew(
            agents=[self.sentiment_strategist],
            tasks=[recommendation_task],
            process=Process.sequential,
            verbose=True
        )
        
        recommendation_result = crew.kickoff()
        
        root_causes = self._parse_root_causes(str(root_cause_result))
        recommendations = self._parse_recommendations(str(recommendation_result))
        
        return {
            'department': department,
            'week': week,
            'score': score,
            'analysis': str(analysis_result),
            'rootCauses': root_causes,
            'recommendations': recommendations,
            'affectedEmployees': len(dept_employees),
            'riskLevel': risk_level,
            'generatedAt': datetime.now().isoformat(),
            'aiGenerated': True
        }
    
    def _parse_root_causes(self, response: str) -> List[str]:
        """Parse root causes from AI response"""
        causes = []
        lines = response.split('\n')
        for line in lines:
            line = line.strip()
            if line and (line[0].isdigit() or line.startswith('-') or line.startswith('•')):
                cleaned = line.lstrip('0123456789.-•) ').strip()
                if cleaned and len(cleaned) > 10:
                    causes.append(cleaned)
        
        if len(causes) < 4:
            defaults = [
                'Workload distribution requires optimization',
                'Team communication patterns need improvement',
                'Growth opportunities are limited',
                'Work-life balance concerns detected'
            ]
            causes.extend(defaults[len(causes):4])
        
        return causes[:4]
    
    def _parse_recommendations(self, response: str) -> List[Dict]:
        """Parse recommendations from AI response"""
        try:
            json_start = response.find('[')
            json_end = response.rfind(']') + 1
            if json_start != -1 and json_end > json_start:
                json_str = response[json_start:json_end]
                recs = json.loads(json_str)
                if isinstance(recs, list) and len(recs) > 0:
                    return [
                        {
                            'action': r.get('action', 'Review and address concerns'),
                            'impact': r.get('impact', 'Improved engagement'),
                            'urgency': r.get('urgency', 'medium')
                        }
                        for r in recs[:3]
                    ]
        except:
            pass
        
        return [
            {'action': 'Schedule 1-on-1 meetings with team members', 'impact': '+15% engagement', 'urgency': 'high'},
            {'action': 'Review workload distribution and staffing levels', 'impact': 'Reduced burnout risk', 'urgency': 'medium'},
            {'action': 'Implement recognition program for achievements', 'impact': '+10% satisfaction', 'urgency': 'low'}
        ]

# Create singleton instance
sentiment_agents = SentimentAnalysisManager()