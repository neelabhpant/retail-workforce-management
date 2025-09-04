"""
Realistic Retail Workforce Data Generator
Generates sample data for the demo application
"""

import random
from datetime import datetime, timedelta
from typing import List, Dict
from faker import Faker
import uuid

fake = Faker()


class RetailDataGenerator:
    """Generates realistic retail workforce data"""
    
    def __init__(self):
        self.departments = [
            'Sales Floor', 'Customer Service', 'Inventory', 'Electronics',
            'Clothing', 'Home & Garden', 'Pharmacy', 'Grocery', 'Deli', 'Bakery'
        ]
        
        self.roles = {
            'Sales Floor': ['Sales Associate', 'Senior Associate', 'Department Lead'],
            'Customer Service': ['Customer Service Rep', 'Service Manager'],
            'Inventory': ['Stock Associate', 'Inventory Specialist', 'Warehouse Lead'],
            'Electronics': ['Tech Associate', 'Electronics Specialist'],
            'Clothing': ['Fashion Associate', 'Visual Merchandiser'],
            'Home & Garden': ['Garden Associate', 'Home Specialist'],
            'Pharmacy': ['Pharmacy Tech', 'Pharmacist'],
            'Grocery': ['Grocery Associate', 'Produce Specialist'],
            'Deli': ['Deli Associate', 'Food Prep'],
            'Bakery': ['Baker', 'Cake Decorator']
        }
        
        self.skills = [
            'Customer Service', 'Product Knowledge', 'Cash Handling', 'Inventory Management',
            'Team Leadership', 'Problem Solving', 'Communication', 'Technical Skills',
            'Visual Merchandising', 'Food Safety', 'Sales Techniques', 'Conflict Resolution'
        ]
        
        self.locations = [
            {'id': 'store_001', 'name': 'Downtown Plaza', 'type': 'flagship'},
            {'id': 'store_002', 'name': 'Suburban Mall', 'type': 'standard'},
            {'id': 'store_003', 'name': 'Strip Center', 'type': 'compact'},
            {'id': 'store_004', 'name': 'Airport Location', 'type': 'express'},
            {'id': 'store_005', 'name': 'University District', 'type': 'standard'}
        ]
    
    def generate_employees(self, count: int = 100) -> List[Dict]:
        """Generate employee data"""
        employees = []
        
        for _ in range(count):
            department = random.choice(self.departments)
            role = random.choice(self.roles[department])
            hire_date = fake.date_between(start_date='-3y', end_date='today')
            tenure_days = (datetime.now().date() - hire_date).days
            
            # Generate realistic performance and satisfaction scores
            base_performance = random.normalvariate(3.5, 0.7)
            performance_score = max(1.0, min(5.0, base_performance))
            
            # Satisfaction often correlates with tenure and performance
            satisfaction_base = 3.5 + (performance_score - 3.5) * 0.3
            if tenure_days < 90:  # New employees might be less satisfied
                satisfaction_base -= 0.5
            elif tenure_days > 730:  # Long-term employees might be more stable
                satisfaction_base += 0.2
            
            satisfaction_score = max(1.0, min(5.0, random.normalvariate(satisfaction_base, 0.6)))
            
            employee = {
                'employee_id': f"emp_{uuid.uuid4().hex[:8]}",
                'name': fake.name(),
                'department': department,
                'role': role,
                'hire_date': hire_date.isoformat(),
                'hourly_wage': round(random.uniform(12, 28), 2),
                'skill_level': random.randint(1, 5),
                'availability_hours': random.choice([20, 25, 30, 35, 40]),
                'location_id': random.choice(self.locations)['id'],
                'manager_id': f"mgr_{random.randint(1, 20):03d}",
                'performance_score': round(performance_score, 2),
                'satisfaction_score': round(satisfaction_score, 2),
                'tenure_days': tenure_days,
                'overtime_hours': random.randint(0, 15),
                'skills': random.sample(self.skills, random.randint(2, 6))
            }
            
            employees.append(employee)
        
        return employees
    
    def generate_schedules(self, employees: List[Dict], weeks: int = 4) -> List[Dict]:
        """Generate schedule data"""
        schedules = []
        
        for week in range(weeks):
            week_start = datetime.now().date() - timedelta(weeks=weeks-week-1)
            
            for employee in employees:
                # Determine how many days this employee works
                availability = employee['availability_hours']
                if availability == 40:
                    days_per_week = 5
                elif availability >= 30:
                    days_per_week = 4
                elif availability >= 20:
                    days_per_week = 3
                else:
                    days_per_week = 2
                
                # Randomly select working days
                working_days = random.sample(range(7), days_per_week)
                
                for day_offset in working_days:
                    shift_date = week_start + timedelta(days=day_offset)
                    
                    # Generate realistic shift times based on department
                    if employee['department'] in ['Pharmacy', 'Customer Service']:
                        # These departments need early coverage
                        start_hour = random.choice([7, 8, 9, 10, 14])
                    elif employee['department'] in ['Electronics', 'Sales Floor']:
                        # These departments need flexible coverage
                        start_hour = random.choice([9, 10, 11, 12, 15, 16])
                    else:
                        start_hour = random.choice([8, 9, 10, 11, 13, 14])
                    
                    shift_length = 8 if availability == 40 else random.choice([6, 7, 8])
                    end_hour = start_hour + shift_length
                    
                    schedule = {
                        'schedule_id': f"sched_{uuid.uuid4().hex[:8]}",
                        'employee_id': employee['employee_id'],
                        'shift_date': shift_date.isoformat(),
                        'start_time': f"{start_hour:02d}:00:00",
                        'end_time': f"{end_hour:02d}:00:00",
                        'department': employee['department'],
                        'status': random.choice(['scheduled', 'completed', 'no_show', 'called_out'])
                    }
                    
                    schedules.append(schedule)
        
        return schedules
    
    def generate_demand_data(self, days: int = 30) -> List[Dict]:
        """Generate customer demand forecast data"""
        demand_data = []
        
        for day in range(days):
            date = datetime.now().date() - timedelta(days=days-day-1)
            day_of_week = date.weekday()  # 0=Monday, 6=Sunday
            
            # Base demand varies by day of week
            base_demand = {
                0: 120,  # Monday
                1: 110,  # Tuesday
                2: 115,  # Wednesday
                3: 125,  # Thursday
                4: 180,  # Friday
                5: 220,  # Saturday
                6: 160   # Sunday
            }[day_of_week]
            
            # Add seasonal variation
            month = date.month
            seasonal_multiplier = 1.0
            if month in [11, 12]:  # Holiday season
                seasonal_multiplier = 1.4
            elif month in [6, 7, 8]:  # Summer
                seasonal_multiplier = 1.2
            elif month in [1, 2]:  # Post-holiday lull
                seasonal_multiplier = 0.8
            
            # Add random variation
            final_demand = int(base_demand * seasonal_multiplier * random.uniform(0.8, 1.2))
            
            for location in self.locations:
                # Adjust demand by location type
                location_multiplier = {
                    'flagship': 1.5,
                    'standard': 1.0,
                    'compact': 0.7,
                    'express': 0.4
                }[location['type']]
                
                location_demand = int(final_demand * location_multiplier)
                required_staff = max(3, int(location_demand / 15))  # Rough staffing ratio
                
                demand = {
                    'forecast_id': f"forecast_{uuid.uuid4().hex[:8]}",
                    'location_id': location['id'],
                    'department': random.choice(self.departments),
                    'forecast_date': date.isoformat(),
                    'predicted_customers': location_demand,
                    'required_staff': required_staff,
                    'confidence_score': round(random.uniform(0.75, 0.95), 3),
                    'day_of_week': day_of_week,
                    'month': month,
                    'is_holiday': 1 if month == 12 and date.day in [24, 25, 31] else 0,
                    'weather_score': round(random.uniform(0.3, 1.0), 2)
                }
                
                demand_data.append(demand)
        
        return demand_data
    
    def generate_retention_factors(self, employees: List[Dict]) -> List[Dict]:
        """Generate retention risk factors for employees"""
        retention_data = []
        
        for employee in employees:
            # Calculate risk factors based on employee data
            factors = {}
            
            # Performance factor
            if employee['performance_score'] < 2.5:
                factors['low_performance'] = 0.8
            elif employee['performance_score'] > 4.0:
                factors['high_performance'] = -0.3
            
            # Satisfaction factor
            if employee['satisfaction_score'] < 2.5:
                factors['low_satisfaction'] = 0.9
            elif employee['satisfaction_score'] > 4.0:
                factors['high_satisfaction'] = -0.4
            
            # Tenure factor
            if employee['tenure_days'] < 90:
                factors['new_employee'] = 0.6
            elif employee['tenure_days'] > 730:
                factors['long_tenure'] = -0.2
            
            # Wage factor
            avg_wage_for_role = 18  # Simplified average
            if employee['hourly_wage'] < avg_wage_for_role - 2:
                factors['below_market_wage'] = 0.5
            elif employee['hourly_wage'] > avg_wage_for_role + 3:
                factors['above_market_wage'] = -0.2
            
            # Overtime factor
            if employee['overtime_hours'] > 10:
                factors['excessive_overtime'] = 0.4
            
            # Calculate overall risk score
            base_risk = 0.3  # Base 30% chance
            factor_impact = sum(factors.values())
            risk_score = max(0.05, min(0.95, base_risk + factor_impact))
            
            retention = {
                'metric_id': f"retention_{uuid.uuid4().hex[:8]}",
                'employee_id': employee['employee_id'],
                'risk_score': round(risk_score, 3),
                'factors': factors,
                'will_leave': 1 if risk_score > 0.7 else 0
            }
            
            retention_data.append(retention)
        
        return retention_data
    
    def generate_learning_paths(self, employees: List[Dict]) -> List[Dict]:
        """Generate learning and development paths"""
        learning_modules = [
            {'name': 'Customer Service Excellence', 'duration': 4, 'difficulty': 'beginner'},
            {'name': 'Advanced Sales Techniques', 'duration': 6, 'difficulty': 'intermediate'},
            {'name': 'Leadership Fundamentals', 'duration': 8, 'difficulty': 'intermediate'},
            {'name': 'Inventory Management Systems', 'duration': 3, 'difficulty': 'beginner'},
            {'name': 'Conflict Resolution', 'duration': 5, 'difficulty': 'intermediate'},
            {'name': 'Visual Merchandising', 'duration': 4, 'difficulty': 'beginner'},
            {'name': 'Team Management', 'duration': 10, 'difficulty': 'advanced'},
            {'name': 'Financial Analysis', 'duration': 12, 'difficulty': 'advanced'},
            {'name': 'Digital Marketing Basics', 'duration': 6, 'difficulty': 'intermediate'},
            {'name': 'Safety and Compliance', 'duration': 2, 'difficulty': 'beginner'}
        ]
        
        learning_data = []
        
        for employee in employees:
            # Determine appropriate learning path based on role and performance
            recommended_modules = []
            
            if employee['role'] in ['Senior Associate', 'Department Lead']:
                # Leadership track
                recommended_modules.extend([
                    'Leadership Fundamentals',
                    'Team Management',
                    'Conflict Resolution'
                ])
            
            if employee['performance_score'] < 3.0:
                # Performance improvement track
                recommended_modules.extend([
                    'Customer Service Excellence',
                    'Safety and Compliance'
                ])
            elif employee['performance_score'] > 4.0:
                # Advanced development track
                recommended_modules.extend([
                    'Advanced Sales Techniques',
                    'Financial Analysis',
                    'Digital Marketing Basics'
                ])
            
            # Department-specific modules
            if employee['department'] in ['Sales Floor', 'Electronics']:
                recommended_modules.append('Advanced Sales Techniques')
            elif employee['department'] in ['Inventory', 'Grocery']:
                recommended_modules.append('Inventory Management Systems')
            elif employee['department'] in ['Clothing', 'Home & Garden']:
                recommended_modules.append('Visual Merchandising')
            
            # Remove duplicates and limit to 3-5 modules
            recommended_modules = list(set(recommended_modules))[:random.randint(3, 5)]
            
            # Create learning path
            total_duration = sum(
                module['duration'] for module in learning_modules 
                if module['name'] in recommended_modules
            )
            
            learning_path = {
                'path_id': f"path_{uuid.uuid4().hex[:8]}",
                'employee_id': employee['employee_id'],
                'current_role': employee['role'],
                'target_role': self._get_next_role(employee['role'], employee['department']),
                'recommended_modules': recommended_modules,
                'total_duration_weeks': total_duration,
                'completion_rate': round(random.uniform(0.1, 0.8), 2),
                'skill_gaps': random.sample(self.skills, random.randint(2, 4)),
                'career_track': self._get_career_track(employee['department'])
            }
            
            learning_data.append(learning_path)
        
        return learning_data
    
    def _get_next_role(self, current_role: str, department: str) -> str:
        """Determine next career step"""
        if 'Associate' in current_role and 'Senior' not in current_role:
            return f"Senior {current_role}"
        elif 'Senior' in current_role:
            return f"{department} Lead"
        elif 'Lead' in current_role:
            return f"{department} Manager"
        else:
            return "Store Manager"
    
    def _get_career_track(self, department: str) -> str:
        """Determine career track based on department"""
        tracks = {
            'Sales Floor': 'Sales Management',
            'Customer Service': 'Customer Experience',
            'Inventory': 'Operations Management',
            'Electronics': 'Technology Specialist',
            'Clothing': 'Fashion Merchandising',
            'Home & Garden': 'Category Management',
            'Pharmacy': 'Healthcare Services',
            'Grocery': 'Food Service Management',
            'Deli': 'Food Service Management',
            'Bakery': 'Culinary Arts'
        }
        return tracks.get(department, 'General Management')
    
    def generate_demo_scenario_data(self, scenario_type: str) -> Dict:
        """Generate specific data for demo scenarios"""
        if scenario_type == 'black_friday':
            return {
                'scenario': 'Black Friday Rush Hour',
                'description': 'Real-time response to 3x customer surge',
                'date_range': '2024-11-29',
                'current_traffic': 450,
                'surge_traffic': 1350,
                'departments_affected': ['Electronics', 'Sales Floor', 'Checkout'],
                'actions': [
                    'Detecting surge via POS transactions',
                    'Analyzing customer patterns with Spark',
                    'ML predicting 2-hour peak duration',
                    'Reallocating 5 staff from stockroom',
                    'Opening 3 additional checkout lanes'
                ],
                'expected_savings': 2400,
                'wait_time_reduction': 8
            }
        elif scenario_type == 'staff_shortage':
            return {
                'scenario': 'Staff Shortage Response',
                'description': '3 employees called out - real-time reallocation',
                'affected_departments': ['Customer Service', 'Electronics'],
                'missing_staff': 3,
                'actions': [
                    'Alert received via attendance system',
                    'ML analyzing coverage requirements',
                    'Identifying available cross-trained staff',
                    'Adjusting break schedules automatically',
                    'Notifying managers of changes'
                ],
                'coverage_maintained': True,
                'overtime_avoided': 6
            }
        elif scenario_type == 'predictive_scheduling':
            return {
                'scenario': 'Next Week Optimization',
                'description': 'ML-driven schedule generation for optimal coverage',
                'forecast_period': '7 days',
                'predicted_patterns': {
                    'Monday': 'Normal traffic - 450 customers',
                    'Tuesday': 'Low traffic - 320 customers',
                    'Wednesday': 'Promotion day - 680 customers',
                    'Thursday': 'Normal traffic - 480 customers',
                    'Friday': 'High traffic - 720 customers',
                    'Saturday': 'Peak traffic - 950 customers',
                    'Sunday': 'Moderate traffic - 550 customers'
                },
                'optimization_metrics': {
                    'labor_cost_saved': 3200,
                    'coverage_score': 94,
                    'employee_satisfaction': 87
                }
            }
        
        return {}