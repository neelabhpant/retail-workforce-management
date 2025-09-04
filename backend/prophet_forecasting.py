"""
Prophet-based Demand Forecasting Module for Retail Workforce Management
Uses Facebook Prophet for time series forecasting with retail-specific patterns
"""

import numpy as np
import pandas as pd
from prophet import Prophet
from datetime import datetime, timedelta
import json
import random
from typing import Dict, List, Any, Optional, Tuple
import plotly.graph_objs as go
from plotly.utils import PlotlyJSONEncoder

class RetailDemandForecaster:
    """
    Advanced demand forecasting using Prophet with retail-specific patterns
    """
    
    def __init__(self):
        self.models = {}  # Store models per department
        self.historical_data = None
        self.forecast_results = {}
        self.department_multipliers = {
            'Sales Floor': 1.2,
            'Customer Service': 1.0,
            'Electronics': 1.3,
            'Clothing': 1.1,
            'Grocery': 1.4,
            'Pharmacy': 0.8,
            'Home & Garden': 0.9,
            'Inventory': 0.7
        }
        
    def generate_historical_data(self, 
                                days_back: int = 365, 
                                departments: List[str] = None) -> pd.DataFrame:
        """
        Generate realistic historical retail data for Prophet training
        """
        if departments is None:
            departments = list(self.department_multipliers.keys())
        
        data_frames = []
        base_date = datetime.now() - timedelta(days=days_back)
        
        for dept in departments:
            dates = pd.date_range(start=base_date, end=datetime.now(), freq='D')
            dept_multiplier = self.department_multipliers.get(dept, 1.0)
            
            # Create base pattern
            base_customers = 150 * dept_multiplier
            
            data = []
            for date in dates:
                # Day of week pattern (Mon=0, Sun=6)
                dow_multipliers = [0.7, 0.75, 0.8, 0.85, 1.2, 1.5, 1.1]
                dow_mult = dow_multipliers[date.dayofweek]
                
                # Monthly seasonality
                month_mult = 1.0
                if date.month in [11, 12]:  # Holiday season
                    month_mult = 1.4
                elif date.month in [6, 7, 8]:  # Summer
                    month_mult = 1.15
                elif date.month in [1, 2]:  # Post-holiday slow period
                    month_mult = 0.85
                
                # Special events
                event_mult = 1.0
                if date.month == 11 and 22 <= date.day <= 28:  # Black Friday week
                    event_mult = 2.0
                elif date.month == 12 and 15 <= date.day <= 24:  # Pre-Christmas
                    event_mult = 1.8
                elif date.day == 1:  # First of month (payday effect)
                    event_mult = 1.2
                elif date.day == 15:  # Mid-month payday
                    event_mult = 1.15
                
                # Weather impact (simulated)
                weather_impact = random.uniform(0.9, 1.1)
                
                # Calculate final customer count with some randomness
                customers = (base_customers * dow_mult * month_mult * 
                           event_mult * weather_impact * 
                           random.uniform(0.85, 1.15))
                
                # Add trend component (slight growth over time)
                days_since_start = (date - base_date).days
                trend = 1 + (days_since_start / 365) * 0.05  # 5% annual growth
                customers *= trend
                
                data.append({
                    'ds': date,
                    'y': int(customers),
                    'department': dept,
                    'day_of_week': date.strftime('%A'),
                    'is_weekend': date.dayofweek >= 5,
                    'is_holiday': event_mult > 1.5,
                    'month': date.month
                })
            
            dept_df = pd.DataFrame(data)
            data_frames.append(dept_df)
        
        self.historical_data = pd.concat(data_frames, ignore_index=True)
        return self.historical_data
    
    def add_retail_holidays(self, model: Prophet) -> Prophet:
        """
        Add retail-specific holidays and events to Prophet model
        """
        # Major retail holidays
        model.add_country_holidays(country_name='US')
        
        # Black Friday (day after Thanksgiving)
        black_fridays = pd.DataFrame({
            'holiday': 'black_friday',
            'ds': pd.to_datetime(['2023-11-24', '2024-11-29', '2025-11-28']),
            'lower_window': -1,
            'upper_window': 2  # Include weekend
        })
        
        # Cyber Monday
        cyber_mondays = pd.DataFrame({
            'holiday': 'cyber_monday',
            'ds': pd.to_datetime(['2023-11-27', '2024-12-02', '2025-12-01']),
            'lower_window': 0,
            'upper_window': 0
        })
        
        # Back to School (August)
        back_to_school = pd.DataFrame({
            'holiday': 'back_to_school',
            'ds': pd.to_datetime(['2023-08-15', '2024-08-15', '2025-08-15']),
            'lower_window': -7,
            'upper_window': 7
        })
        
        # Combine all holidays
        holidays = pd.concat([black_fridays, cyber_mondays, back_to_school], 
                           ignore_index=True)
        
        model.holidays = holidays
        return model
    
    def train_prophet_model(self, 
                           department: str,
                           include_regressors: bool = True) -> Prophet:
        """
        Train a Prophet model for a specific department
        """
        # Filter data for department
        dept_data = self.historical_data[
            self.historical_data['department'] == department
        ][['ds', 'y']].copy()
        
        # Initialize Prophet with retail-specific parameters
        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            seasonality_mode='multiplicative',  # Better for retail
            changepoint_prior_scale=0.05,  # More flexible trend
            seasonality_prior_scale=10,  # Strong seasonality
            holidays_prior_scale=20,  # Strong holiday effects
            interval_width=0.95
        )
        
        # Add holidays
        model = self.add_retail_holidays(model)
        
        # Add custom seasonalities
        model.add_seasonality(
            name='monthly',
            period=30.5,
            fourier_order=5
        )
        
        # Add payday effects (1st and 15th of month)
        model.add_seasonality(
            name='biweekly_payday',
            period=14,
            fourier_order=3
        )
        
        # Fit the model
        model.fit(dept_data)
        
        # Store the model
        self.models[department] = model
        
        return model
    
    def forecast_demand(self,
                       department: str,
                       periods: int = 14,
                       include_history: bool = False) -> pd.DataFrame:
        """
        Generate demand forecast for a department
        """
        if department not in self.models:
            # Train model if not exists
            if self.historical_data is None:
                self.generate_historical_data()
            self.train_prophet_model(department)
        
        model = self.models[department]
        
        # Create future dataframe
        future = model.make_future_dataframe(
            periods=periods,
            include_history=include_history
        )
        
        # Generate forecast
        forecast = model.predict(future)
        
        # Add department info
        forecast['department'] = department
        
        # Calculate staffing requirements (1 staff per 25 customers)
        forecast['required_staff'] = np.maximum(
            1,
            np.ceil(forecast['yhat'] / 25)
        )
        
        # Add confidence bands for staffing
        forecast['required_staff_lower'] = np.maximum(
            1,
            np.ceil(forecast['yhat_lower'] / 25)
        )
        forecast['required_staff_upper'] = np.ceil(forecast['yhat_upper'] / 25)
        
        # Store results
        self.forecast_results[department] = forecast
        
        return forecast
    
    def forecast_all_departments(self,
                                departments: List[str] = None,
                                periods: int = 14) -> Dict[str, pd.DataFrame]:
        """
        Generate forecasts for multiple departments
        """
        if departments is None:
            departments = list(self.department_multipliers.keys())[:3]  # Default top 3
        
        all_forecasts = {}
        
        for dept in departments:
            forecast = self.forecast_demand(dept, periods=periods)
            all_forecasts[dept] = forecast
        
        return all_forecasts
    
    def get_hourly_distribution(self, 
                               daily_customers: int,
                               department: str) -> List[Dict[str, Any]]:
        """
        Distribute daily forecast into hourly predictions
        """
        # Hourly distribution patterns by department
        hourly_patterns = {
            'default': [
                0.02, 0.01, 0.01, 0.01, 0.02, 0.03,  # 12am-6am
                0.04, 0.05, 0.07, 0.09, 0.11, 0.12,  # 6am-12pm
                0.10, 0.09, 0.08, 0.07, 0.06, 0.05,  # 12pm-6pm
                0.04, 0.03, 0.02, 0.01, 0.01, 0.01   # 6pm-12am
            ],
            'Grocery': [
                0.01, 0.01, 0.01, 0.01, 0.02, 0.03,  # Early morning
                0.05, 0.07, 0.09, 0.10, 0.11, 0.10,  # Morning rush
                0.09, 0.08, 0.07, 0.06, 0.08, 0.09,  # Afternoon/evening
                0.07, 0.05, 0.03, 0.02, 0.01, 0.01   # Late evening
            ],
            'Electronics': [
                0.01, 0.01, 0.01, 0.01, 0.01, 0.02,  # Night
                0.03, 0.04, 0.05, 0.07, 0.09, 0.11,  # Morning
                0.12, 0.11, 0.10, 0.09, 0.08, 0.07,  # Afternoon/evening
                0.06, 0.04, 0.02, 0.01, 0.01, 0.01   # Late night
            ]
        }
        
        pattern = hourly_patterns.get(department, hourly_patterns['default'])
        
        hourly_forecast = []
        for hour in range(24):
            customers = int(daily_customers * pattern[hour])
            staff_needed = max(1, int(customers / 15))  # 1 staff per 15 customers/hour
            
            hourly_forecast.append({
                'hour': hour,
                'hour_label': f"{hour:02d}:00",
                'predicted_customers': customers,
                'required_staff': staff_needed,
                'confidence': 0.85 + random.uniform(-0.1, 0.1)
            })
        
        return hourly_forecast
    
    def create_forecast_visualization(self, 
                                     department: str) -> str:
        """
        Create interactive Plotly visualization of forecast
        """
        if department not in self.forecast_results:
            return None
        
        forecast = self.forecast_results[department]
        
        # Create the plot
        fig = go.Figure()
        
        # Add actual/predicted customer traffic
        fig.add_trace(go.Scatter(
            x=forecast['ds'],
            y=forecast['yhat'],
            mode='lines',
            name='Predicted Customers',
            line=dict(color='blue', width=2)
        ))
        
        # Add confidence intervals
        fig.add_trace(go.Scatter(
            x=forecast['ds'],
            y=forecast['yhat_upper'],
            mode='lines',
            name='Upper Bound',
            line=dict(width=0),
            showlegend=False
        ))
        
        fig.add_trace(go.Scatter(
            x=forecast['ds'],
            y=forecast['yhat_lower'],
            mode='lines',
            name='Lower Bound',
            fill='tonexty',
            fillcolor='rgba(0,100,200,0.2)',
            line=dict(width=0),
            showlegend=False
        ))
        
        # Add staffing requirements on secondary y-axis
        fig.add_trace(go.Scatter(
            x=forecast['ds'],
            y=forecast['required_staff'],
            mode='lines+markers',
            name='Required Staff',
            line=dict(color='green', width=2, dash='dash'),
            marker=dict(size=6),
            yaxis='y2'
        ))
        
        # Update layout
        fig.update_layout(
            title=f'Demand Forecast - {department}',
            xaxis_title='Date',
            yaxis_title='Customer Traffic',
            yaxis2=dict(
                title='Required Staff',
                overlaying='y',
                side='right'
            ),
            hovermode='x unified',
            height=400,
            template='plotly_white'
        )
        
        # Convert to JSON for frontend
        return json.dumps(fig, cls=PlotlyJSONEncoder)
    
    def get_optimization_insights(self, 
                                 departments: List[str]) -> Dict[str, Any]:
        """
        Generate insights from forecasts for optimization
        """
        insights = {
            'peak_periods': [],
            'low_periods': [],
            'staffing_recommendations': [],
            'cost_optimization': [],
            'confidence_scores': {}
        }
        
        for dept in departments:
            if dept not in self.forecast_results:
                continue
            
            forecast = self.forecast_results[dept]
            future_forecast = forecast[forecast['ds'] > datetime.now()]
            
            if len(future_forecast) > 0:
                # Find peak days
                peak_day = future_forecast.loc[future_forecast['yhat'].idxmax()]
                insights['peak_periods'].append({
                    'department': dept,
                    'date': peak_day['ds'].strftime('%Y-%m-%d'),
                    'expected_customers': int(peak_day['yhat']),
                    'required_staff': int(peak_day['required_staff'])
                })
                
                # Find low periods
                low_day = future_forecast.loc[future_forecast['yhat'].idxmin()]
                insights['low_periods'].append({
                    'department': dept,
                    'date': low_day['ds'].strftime('%Y-%m-%d'),
                    'expected_customers': int(low_day['yhat']),
                    'required_staff': int(low_day['required_staff'])
                })
                
                # Calculate average confidence
                avg_confidence = 1 - (
                    (future_forecast['yhat_upper'] - future_forecast['yhat_lower']) / 
                    (2 * future_forecast['yhat'])
                ).mean()
                insights['confidence_scores'][dept] = round(avg_confidence, 3)
        
        # Generate recommendations
        insights['staffing_recommendations'] = [
            f"Schedule {len([p for p in insights['peak_periods'] if p['required_staff'] > 5])} additional staff for peak periods",
            f"Consider cross-training for departments with confidence < 0.8",
            "Implement flexible scheduling for uncertain periods"
        ]
        
        return insights
    
    def export_forecast_data(self, 
                            departments: List[str],
                            format: str = 'json') -> Any:
        """
        Export forecast data in various formats
        """
        export_data = {}
        
        for dept in departments:
            if dept not in self.forecast_results:
                continue
            
            forecast = self.forecast_results[dept]
            future_forecast = forecast[forecast['ds'] > datetime.now()].head(14)
            
            export_data[dept] = {
                'dates': future_forecast['ds'].dt.strftime('%Y-%m-%d').tolist(),
                'predicted_customers': future_forecast['yhat'].round().tolist(),
                'required_staff': future_forecast['required_staff'].tolist(),
                'confidence_lower': future_forecast['yhat_lower'].round().tolist(),
                'confidence_upper': future_forecast['yhat_upper'].round().tolist()
            }
        
        if format == 'json':
            return json.dumps(export_data, indent=2)
        elif format == 'dataframe':
            return pd.DataFrame(export_data)
        else:
            return export_data


# Singleton instance for use across the application
forecaster = RetailDemandForecaster()