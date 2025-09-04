"""
Mock Cloudera Data Platform Services
Simulates CDP components without requiring actual infrastructure
"""

import asyncio
import json
import random
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from enum import Enum
import duckdb
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import numpy as np


class ComponentStatus(Enum):
    IDLE = "idle"
    ACTIVE = "active"
    PROCESSING = "processing"
    ERROR = "error"


class MockCDPDataWarehouse:
    """Simulates Cloudera Data Warehouse using DuckDB"""
    
    def __init__(self, db_path: str = ":memory:"):
        self.conn = duckdb.connect(db_path)
        self.status = ComponentStatus.IDLE
        self.initialize_schema()
    
    def initialize_schema(self):
        """Create tables for retail workforce data"""
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS employees (
                employee_id VARCHAR PRIMARY KEY,
                name VARCHAR,
                department VARCHAR,
                role VARCHAR,
                hire_date DATE,
                hourly_wage DECIMAL,
                skill_level INTEGER,
                availability_hours INTEGER,
                location_id VARCHAR,
                manager_id VARCHAR,
                performance_score DECIMAL,
                satisfaction_score DECIMAL,
                tenure_days INTEGER,
                overtime_hours INTEGER,
                skills JSON,
                created_at TIMESTAMP DEFAULT NOW()
            )
        """)
        
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS schedules (
                schedule_id VARCHAR PRIMARY KEY,
                employee_id VARCHAR,
                shift_date DATE,
                start_time TIME,
                end_time TIME,
                department VARCHAR,
                status VARCHAR,
                created_at TIMESTAMP DEFAULT NOW()
            )
        """)
        
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS demand_forecast (
                forecast_id VARCHAR PRIMARY KEY,
                location_id VARCHAR,
                department VARCHAR,
                forecast_date DATE,
                predicted_customers INTEGER,
                required_staff INTEGER,
                confidence_score DECIMAL,
                day_of_week INTEGER,
                month INTEGER,
                is_holiday INTEGER,
                weather_score DECIMAL,
                created_at TIMESTAMP DEFAULT NOW()
            )
        """)
        
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS retention_metrics (
                metric_id VARCHAR PRIMARY KEY,
                employee_id VARCHAR,
                risk_score DECIMAL,
                factors JSON,
                will_leave INTEGER,
                last_updated TIMESTAMP DEFAULT NOW()
            )
        """)
    
    async def query(self, sql: str, params: Optional[Dict] = None) -> List[Dict]:
        """Execute SQL query and return results"""
        self.status = ComponentStatus.PROCESSING
        await asyncio.sleep(0.1)  # Simulate processing time
        
        try:
            if params:
                result = self.conn.execute(sql, params).fetchall()
            else:
                result = self.conn.execute(sql).fetchall()
            
            columns = [desc[0] for desc in self.conn.description]
            data = [dict(zip(columns, row)) for row in result]
            
            self.status = ComponentStatus.IDLE
            return data
        except Exception as e:
            self.status = ComponentStatus.ERROR
            raise e
    
    async def insert_bulk(self, table: str, data: List[Dict]):
        """Insert multiple records"""
        self.status = ComponentStatus.PROCESSING
        await asyncio.sleep(0.2)
        
        if not data:
            self.status = ComponentStatus.IDLE
            return
            
        df = pd.DataFrame(data)
        
        # Get the column names from the dataframe
        columns = ', '.join(df.columns)
        
        self.conn.register('temp_df', df)
        self.conn.execute(f"INSERT INTO {table} ({columns}) SELECT {columns} FROM temp_df")
        
        self.status = ComponentStatus.IDLE


class MockCloudearML:
    """Simulates Cloudera Machine Learning platform"""
    
    def __init__(self):
        self.status = ComponentStatus.IDLE
        self.models = {
            'retention_model': RandomForestClassifier(n_estimators=100),
            'demand_forecast': RandomForestRegressor(n_estimators=100),
            'schedule_optimizer': RandomForestRegressor(n_estimators=50),
            'skill_matcher': RandomForestClassifier(n_estimators=50)
        }
        self.scalers = {}
        self.is_trained = False
    
    async def train_models(self, training_data: Dict[str, pd.DataFrame]):
        """Train all ML models with provided data"""
        self.status = ComponentStatus.PROCESSING
        await asyncio.sleep(2)  # Simulate training time
        
        try:
            # Train retention model
            if 'retention' in training_data:
                df = training_data['retention']
                
                # Check if required columns exist, otherwise use risk_score
                if 'performance_score' in df.columns:
                    X = df[['performance_score', 'satisfaction_score', 'tenure_days', 'overtime_hours']].fillna(0)
                else:
                    # Use simple features from retention metrics
                    X = df[['risk_score']].fillna(0.5)
                
                # Use will_leave or compute from risk_score
                if 'will_leave' in df.columns:
                    y = df['will_leave'].fillna(0)
                else:
                    y = (df['risk_score'] > 0.7).astype(int)
                
                if X.shape[1] > 0:
                    scaler = StandardScaler()
                    X_scaled = scaler.fit_transform(X)
                    self.scalers['retention'] = scaler
                    self.models['retention_model'].fit(X_scaled, y)
            
            # Train demand forecast model
            if 'demand' in training_data:
                df = training_data['demand']
                
                # Check available columns
                feature_cols = []
                if 'day_of_week' in df.columns:
                    feature_cols.extend(['day_of_week', 'month', 'is_holiday', 'weather_score'])
                    
                if feature_cols:
                    X = df[feature_cols].fillna(0)
                else:
                    # Use any numeric columns available
                    X = df.select_dtypes(include=['number']).drop(['predicted_customers', 'required_staff'], axis=1, errors='ignore')
                
                # Use predicted_customers or customer_count as target
                if 'customer_count' in df.columns:
                    y = df['customer_count'].fillna(0)
                elif 'predicted_customers' in df.columns:
                    y = df['predicted_customers'].fillna(100)
                else:
                    y = pd.Series([100] * len(df))  # Default values
                
                if X.shape[1] > 0:
                    scaler = StandardScaler()
                    X_scaled = scaler.fit_transform(X)
                    self.scalers['demand'] = scaler
                    self.models['demand_forecast'].fit(X_scaled, y)
            
            self.is_trained = True
            self.status = ComponentStatus.IDLE
            
        except Exception as e:
            self.status = ComponentStatus.ERROR
            raise e
    
    async def predict_retention_risk(self, employee_data: Dict) -> float:
        """Predict employee retention risk"""
        self.status = ComponentStatus.ACTIVE
        await asyncio.sleep(0.3)
        
        if not self.is_trained:
            # Return random prediction if not trained
            self.status = ComponentStatus.IDLE
            return random.uniform(0.1, 0.9)
        
        features = np.array([[
            employee_data.get('performance_score', 3.5),
            employee_data.get('satisfaction_score', 3.5),
            employee_data.get('tenure_days', 365),
            employee_data.get('overtime_hours', 5)
        ]])
        
        if 'retention' in self.scalers:
            features = self.scalers['retention'].transform(features)
        
        risk = self.models['retention_model'].predict_proba(features)[0][1]
        self.status = ComponentStatus.IDLE
        return float(risk)
    
    async def forecast_demand(self, date_features: Dict) -> int:
        """Forecast customer demand"""
        self.status = ComponentStatus.ACTIVE
        await asyncio.sleep(0.2)
        
        if not self.is_trained:
            # Return random forecast if not trained
            self.status = ComponentStatus.IDLE
            return random.randint(50, 200)
        
        features = np.array([[
            date_features.get('day_of_week', 1),
            date_features.get('month', 6),
            date_features.get('is_holiday', 0),
            date_features.get('weather_score', 0.7)
        ]])
        
        if 'demand' in self.scalers:
            features = self.scalers['demand'].transform(features)
        
        demand = self.models['demand_forecast'].predict(features)[0]
        self.status = ComponentStatus.IDLE
        return max(int(demand), 10)
    
    async def optimize_schedule(self, constraints: Dict) -> Dict:
        """Generate optimized schedule recommendations"""
        self.status = ComponentStatus.PROCESSING
        await asyncio.sleep(1)
        
        # Simulate schedule optimization
        recommendations = {
            'total_cost': random.uniform(8000, 12000),
            'coverage_score': random.uniform(0.85, 0.98),
            'employee_satisfaction': random.uniform(0.75, 0.95),
            'shifts': []
        }
        
        # Generate sample shift recommendations
        for i in range(constraints.get('num_shifts', 20)):
            recommendations['shifts'].append({
                'employee_id': f"emp_{i:03d}",
                'start_time': f"{random.randint(6, 10):02d}:00",
                'end_time': f"{random.randint(14, 22):02d}:00",
                'confidence': random.uniform(0.7, 1.0)
            })
        
        self.status = ComponentStatus.IDLE
        return recommendations


class MockDataFlow:
    """Simulates Cloudera DataFlow (Kafka-like streaming)"""
    
    def __init__(self):
        self.status = ComponentStatus.IDLE
        self.topics = {}
        self.subscribers = {}
        self.message_queue = asyncio.Queue()
    
    async def create_topic(self, topic_name: str):
        """Create a new data stream topic"""
        self.topics[topic_name] = []
        self.subscribers[topic_name] = []
    
    async def publish(self, topic: str, message: Dict):
        """Publish message to topic"""
        self.status = ComponentStatus.ACTIVE
        
        if topic not in self.topics:
            await self.create_topic(topic)
        
        message_with_metadata = {
            'timestamp': datetime.now().isoformat(),
            'topic': topic,
            'data': message
        }
        
        self.topics[topic].append(message_with_metadata)
        
        # Notify subscribers
        for callback in self.subscribers.get(topic, []):
            await callback(message_with_metadata)
        
        self.status = ComponentStatus.IDLE
    
    async def subscribe(self, topic: str, callback):
        """Subscribe to topic messages"""
        if topic not in self.subscribers:
            self.subscribers[topic] = []
        self.subscribers[topic].append(callback)
    
    async def get_recent_messages(self, topic: str, limit: int = 10) -> List[Dict]:
        """Get recent messages from topic"""
        if topic not in self.topics:
            return []
        return self.topics[topic][-limit:]


class MockCDPPlatform:
    """Main CDP platform orchestrator"""
    
    def __init__(self):
        self.data_warehouse = MockCDPDataWarehouse()
        self.ml_platform = MockCloudearML()
        self.data_flow = MockDataFlow()
        self.event_log = []
        
        # Initialize data flow topics - will be done in startup event
        # asyncio.create_task(self._initialize_topics())
    
    async def _initialize_topics(self):
        """Initialize streaming topics"""
        topics = [
            'employee_updates',
            'schedule_changes',
            'demand_signals',
            'retention_alerts',
            'system_metrics'
        ]
        
        for topic in topics:
            await self.data_flow.create_topic(topic)
    
    async def log_event(self, component: str, event_type: str, details: Dict):
        """Log platform events"""
        event = {
            'timestamp': datetime.now().isoformat(),
            'component': component,
            'event_type': event_type,
            'details': details
        }
        
        self.event_log.append(event)
        
        # Publish to system metrics topic
        await self.data_flow.publish('system_metrics', event)
        
        # Keep only last 1000 events
        if len(self.event_log) > 1000:
            self.event_log = self.event_log[-1000:]
    
    async def get_platform_status(self) -> Dict:
        """Get overall platform status"""
        return {
            'data_warehouse': self.data_warehouse.status.value,
            'ml_platform': self.ml_platform.status.value,
            'data_flow': self.data_flow.status.value,
            'total_events': len(self.event_log),
            'uptime': '99.9%',
            'last_update': datetime.now().isoformat()
        }
    
    async def process_workforce_data(self, data_type: str, data: Dict) -> Dict:
        """Process different types of workforce data"""
        await self.log_event('platform', 'data_processing_started', {
            'type': data_type,
            'size': len(str(data))
        })
        
        result = {}
        
        if data_type == 'employee_update':
            # Store in data warehouse
            await self.data_warehouse.query(
                "INSERT OR REPLACE INTO employees VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                data
            )
            
            # Calculate retention risk
            risk_score = await self.ml_platform.predict_retention_risk(data)
            result['retention_risk'] = risk_score
            
            # Publish to stream
            await self.data_flow.publish('employee_updates', {
                'employee_id': data.get('employee_id'),
                'risk_score': risk_score
            })
        
        elif data_type == 'demand_forecast':
            # Generate forecast
            forecast = await self.ml_platform.forecast_demand(data)
            result['predicted_demand'] = forecast
            
            # Store forecast
            await self.data_warehouse.query(
                "INSERT INTO demand_forecast VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                data
            )
            
            # Publish to stream
            await self.data_flow.publish('demand_signals', {
                'location_id': data.get('location_id'),
                'forecast': forecast
            })
        
        await self.log_event('platform', 'data_processing_completed', {
            'type': data_type,
            'result_size': len(str(result))
        })
        
        return result