import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Target,
  Play,
  RefreshCw,
  Download,
  Bot,
  CheckCircle,
  Lightbulb
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { api, OptimizationResult, DemandForecastResult } from '../services/api';
import { format, addDays, startOfWeek } from 'date-fns';

interface ScheduleOptimizationRequest {
  date_range: string;
  locations: string[];
  departments: string[];
  constraints: string[];
}


interface AgentProgress {
  name: string;
  displayName: string;
  status: 'waiting' | 'working' | 'completed';
  decision: string;
}

const SchedulingDashboard: React.FC = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [demandForecast, setDemandForecast] = useState<DemandForecastResult | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(['Sales Floor', 'Customer Service']);
  const [schedulingConstraints, setSchedulingConstraints] = useState<string[]>(['labor_cost_limit', 'employee_preferences']);
  const [useCrewAI, setUseCrewAI] = useState(true);
  const [agentUpdates, setAgentUpdates] = useState<any[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [agentProgress, setAgentProgress] = useState<AgentProgress[]>([
    { name: 'demand_forecaster', displayName: 'Demand Forecaster', status: 'waiting', decision: 'Waiting to start...' },
    { name: 'staff_optimizer', displayName: 'Staff Optimizer', status: 'waiting', decision: 'Waiting for demand forecast...' },
    { name: 'cost_analyst', displayName: 'Cost Analyst', status: 'waiting', decision: 'Waiting for schedule...' },
    { name: 'compliance_checker', displayName: 'Compliance Checker', status: 'waiting', decision: 'Waiting to verify...' },
    { name: 'quality_auditor', displayName: 'Quality Auditor', status: 'waiting', decision: 'Waiting for final review...' },
  ]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const factTimerRef = useRef<NodeJS.Timeout | null>(null);

  const departments = [
    'Sales Floor', 'Customer Service', 'Electronics', 'Clothing', 
    'Home & Garden', 'Pharmacy', 'Grocery', 'Inventory'
  ];

  const constraints = [
    { id: 'labor_cost_limit', label: 'Labor Cost Optimization', description: 'Minimize labor costs while meeting demand' },
    { id: 'employee_preferences', label: 'Employee Preferences', description: 'Consider employee availability and preferences' },
    { id: 'skill_matching', label: 'Skill Matching', description: 'Match employees with required skills' },
    { id: 'overtime_control', label: 'Overtime Control', description: 'Minimize overtime hours' },
    { id: 'break_compliance', label: 'Break Compliance', description: 'Ensure proper break scheduling' },
    { id: 'coverage_goals', label: 'Coverage Goals', description: 'Maintain minimum staffing levels' }
  ];

  const optimizationFacts = [
    "AI considers 50+ factors per shift assignment",
    "Prophet ML analyzes 365 days of historical data",
    "Each agent specializes in one optimization domain",
    "Skill matching ensures certified staff for each role",
    "Labor law compliance is checked automatically",
    "Employee preferences improve satisfaction by 23%",
    "Real-time demand adjustments prevent overstaffing",
    "Cross-training opportunities are identified automatically"
  ];

  useEffect(() => {
    loadDemandForecast();
  }, []);

  useEffect(() => {
    if (isOptimizing) {
      setElapsedTime(0);
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      
      factTimerRef.current = setInterval(() => {
        setCurrentFactIndex(prev => (prev + 1) % optimizationFacts.length);
      }, 4000);
      
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (factTimerRef.current) clearInterval(factTimerRef.current);
      };
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (factTimerRef.current) clearInterval(factTimerRef.current);
    }
  }, [isOptimizing, optimizationFacts.length]);

  useEffect(() => {
    if (isOptimizing && useCrewAI) {
      // Setup WebSocket connection for real-time updates
      const wsUrl = `ws://localhost:8000/ws`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected for optimization updates');
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'agent_update') {
            handleAgentUpdate(message);
          } else if (message.type === 'optimization_complete') {
            console.log('Optimization completed via WebSocket');
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return () => {
        ws.close();
      };
    }
  }, [isOptimizing, useCrewAI]);

  const loadDemandForecast = async () => {
    console.log('Loading demand forecast...');
    try {
      const response = await api.forecastDemand({
        period: '2_weeks',
        locations: ['store_001', 'store_002'],
        events: []
      });
      
      console.log('Demand forecast response:', response);
      
      if (response.success) {
        setDemandForecast(response.data);
        console.log('Demand forecast data set:', response.data);
      } else {
        console.error('Demand forecast failed - success=false');
      }
    } catch (error) {
      console.error('Failed to load demand forecast:', error);
      alert(`Failed to load demand forecast: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const runOptimization = async () => {
    console.log('Run Optimization clicked!', { useCrewAI, selectedDepartments, schedulingConstraints });
    
    setIsOptimizing(true);
    setOptimizationResult(null);
    setAgentUpdates([]);
    resetAgentProgress();
    
    try {
      const weekStart = startOfWeek(new Date(selectedWeek));
      const weekEnd = addDays(weekStart, 6);
      
      const request: ScheduleOptimizationRequest = {
        date_range: `${format(weekStart, 'yyyy-MM-dd')} to ${format(weekEnd, 'yyyy-MM-dd')}`,
        locations: ['store_001', 'store_002', 'store_003'],
        departments: selectedDepartments,
        constraints: schedulingConstraints
      };
      
      console.log('Sending optimization request:', request);
      
      let response;
      if (useCrewAI) {
        console.log('Using CrewAI optimization...');
        response = await api.optimizeScheduleCrewAI(request);
      } else {
        console.log('Using basic optimization...');
        response = await api.optimizeSchedule(request);
      }
      
      console.log('Optimization response:', response);
      
      if (response.success) {
        console.log('Full optimization response:', response);
        console.log('Optimization data:', response.data);
        console.log('Number of shifts:', response.data.shifts ? response.data.shifts.length : 0);
        console.log('Shifts array:', response.data.shifts);
        console.log('Selected departments:', selectedDepartments);
        
        setOptimizationResult(response.data);
        console.log('Optimization result set:', response.data);
      } else {
        console.error('Optimization failed - success=false');
      }
    } catch (error) {
      console.error('Optimization failed with error:', error);
      alert(`Optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsOptimizing(false);
    }
  };

  const toggleDepartment = (dept: string) => {
    setSelectedDepartments(prev => 
      prev.includes(dept) 
        ? prev.filter(d => d !== dept)
        : [...prev, dept]
    );
  };

  const toggleConstraint = (constraint: string) => {
    setSchedulingConstraints(prev =>
      prev.includes(constraint)
        ? prev.filter(c => c !== constraint)
        : [...prev, constraint]
    );
  };

  const handleAgentUpdate = (update: any) => {
    setAgentUpdates(prev => [...prev, update]);
    console.log('Agent update received:', update);
    
    setAgentProgress(prev => prev.map(agent => {
      if (agent.name === update.agent) {
        return {
          ...agent,
          status: update.status === 'completed' ? 'completed' : 'working',
          decision: update.decision || agent.decision
        };
      }
      return agent;
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetAgentProgress = () => {
    setAgentProgress([
      { name: 'demand_forecaster', displayName: 'Demand Forecaster', status: 'waiting', decision: 'Waiting to start...' },
      { name: 'staff_optimizer', displayName: 'Staff Optimizer', status: 'waiting', decision: 'Waiting for demand forecast...' },
      { name: 'cost_analyst', displayName: 'Cost Analyst', status: 'waiting', decision: 'Waiting for schedule...' },
      { name: 'compliance_checker', displayName: 'Compliance Checker', status: 'waiting', decision: 'Waiting to verify...' },
      { name: 'quality_auditor', displayName: 'Quality Auditor', status: 'waiting', decision: 'Waiting for final review...' },
    ]);
  };

  // Prepare chart data
  const demandChartData = demandForecast?.predictions.slice(0, 7).map(pred => ({
    day: format(new Date(pred.date), 'EEE'),
    customers: pred.total_predicted_customers,
    required_staff: pred.total_required_staff
  })) || [];

  const optimizationMetrics = optimizationResult ? [
    { label: 'Total Cost', value: optimizationResult.total_cost != null ? `$${optimizationResult.total_cost.toLocaleString()}` : '$0', icon: DollarSign, color: 'text-green-600' },
    { label: 'Coverage Score', value: optimizationResult.coverage_score != null ? `${(optimizationResult.coverage_score * 100).toFixed(1)}%` : '0%', icon: Target, color: 'text-blue-600' },
    { label: 'Employee Satisfaction', value: optimizationResult.employee_satisfaction != null ? `${(optimizationResult.employee_satisfaction * 100).toFixed(1)}%` : '0%', icon: Users, color: 'text-purple-600' },
    { label: 'Cost Savings', value: optimizationResult.cost_savings != null ? `$${optimizationResult.cost_savings.toLocaleString()}` : '$0', icon: TrendingUp, color: 'text-emerald-600' }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI-Powered Scheduling</h1>
          <p className="text-gray-600 mt-1">Optimize workforce schedules with machine learning</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={loadDemandForecast}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Forecast</span>
          </button>
          
          {optimizationResult && (
            <button className="flex items-center space-x-2 px-4 py-2 bg-cdp-blue text-white rounded-md hover:bg-cdp-dark transition-colors">
              <Download className="h-4 w-4" />
              <span>Export Schedule</span>
            </button>
          )}
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Schedule Optimization Configuration</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Week Starting
            </label>
            <input
              type="date"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cdp-blue focus:border-transparent"
            />
          </div>

          {/* Department Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Departments ({selectedDepartments.length})
            </label>
            <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
              {departments.map(dept => (
                <label key={dept} className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    checked={selectedDepartments.includes(dept)}
                    onChange={() => toggleDepartment(dept)}
                    className="text-cdp-blue focus:ring-cdp-blue"
                  />
                  <span className="text-sm">{dept}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Constraints */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Optimization Constraints
            </label>
            <div className="space-y-2">
              {constraints.slice(0, 3).map(constraint => (
                <label key={constraint.id} className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    checked={schedulingConstraints.includes(constraint.id)}
                    onChange={() => toggleConstraint(constraint.id)}
                    className="mt-1 text-cdp-blue focus:ring-cdp-blue"
                  />
                  <div>
                    <div className="text-sm font-medium">{constraint.label}</div>
                    <div className="text-xs text-gray-500">{constraint.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={runOptimization}
              disabled={isOptimizing || selectedDepartments.length === 0}
              className="flex items-center space-x-2 px-6 py-3 bg-cdp-blue text-white rounded-md hover:bg-cdp-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isOptimizing ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Optimizing (45-60 seconds)...</span>
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  <span>Run Optimization</span>
                </>
              )}
            </button>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="use-crewai"
                checked={useCrewAI}
                onChange={(e) => setUseCrewAI(e.target.checked)}
                className="text-cdp-blue focus:ring-cdp-blue"
              />
              <label 
                htmlFor="use-crewai" 
                className="text-sm font-medium text-gray-700 flex items-center space-x-1"
                title="Enable multi-agent AI system with 5 specialized agents working together: Demand Forecaster, Staff Optimizer, Cost Analyst, Compliance Checker, and Quality Auditor"
              >
                <Bot className="h-4 w-4" />
                <span>Use AI Agents</span>
              </label>
              <div className="text-xs text-gray-500">
                (5 agents collaborate for better results)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demand Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Customer Demand Forecast</h2>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demandChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="customers" fill="#3B82F6" name="Predicted Customers" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {demandForecast && demandForecast.summary && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded">
                <div className="text-sm text-blue-600 font-medium">Peak Day</div>
                <div className="text-lg font-bold text-blue-900">
                  {demandForecast.summary.peak_day ? format(new Date(demandForecast.summary.peak_day), 'EEE, MMM d') : 'N/A'}
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <div className="text-sm text-green-600 font-medium">Avg Daily Customers</div>
                <div className="text-lg font-bold text-green-900">
                  {demandForecast.summary.avg_daily_customers ? demandForecast.summary.avg_daily_customers.toLocaleString() : '0'}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Staffing Requirements</h2>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={demandChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="required_staff" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name="Required Staff"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {demandForecast && demandForecast.summary && (
            <div className="mt-4">
              <div className="bg-emerald-50 p-3 rounded">
                <div className="text-sm text-emerald-600 font-medium">Total Staff Hours Needed</div>
                <div className="text-lg font-bold text-emerald-900">
                  {demandForecast.summary.total_staff_hours_needed ? demandForecast.summary.total_staff_hours_needed.toLocaleString() : '0'} hours
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Optimization Results */}
      {optimizationResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {optimizationMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                      <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${metric.color}`} />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Schedule Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Optimized Schedule Overview</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Schedule Stats */}
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">Total Shifts</span>
                  <span className="font-semibold">{optimizationResult.total_shifts}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">Departments</span>
                  <span className="font-semibold">{selectedDepartments.length}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">Optimization Time</span>
                  <span className="font-semibold">2.3s</span>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="text-lg font-medium mb-3">AI Recommendations</h3>
                <div className="space-y-2">
                  {optimizationResult.recommendations.slice(0, 4).map((rec, index) => (
                    <div key={index} className="flex items-start space-x-2 p-2 bg-blue-50 rounded">
                      <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-blue-800">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Alerts */}
              <div>
                <h3 className="text-lg font-medium mb-3">Risk Alerts</h3>
                <div className="space-y-2">
                  {optimizationResult.risks.map((risk, index) => (
                    <div key={index} className="flex items-start space-x-2 p-2 bg-yellow-50 rounded">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-yellow-800">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Schedule Grid */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Optimized Weekly Schedule</h2>
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-gray-600">High Confidence (≥80%)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span className="text-gray-600">Medium Confidence (60-79%)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-gray-600">Low Confidence (&lt;60%)</span>
                </div>
              </div>
            </div>
            
            {/* Calendar View */}
            <div className="mb-6">
              <div className="grid grid-cols-8 gap-2 mb-2">
                <div className="text-xs font-medium text-gray-500 py-2"></div>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="text-xs font-medium text-gray-500 py-2 text-center">
                    {day}
                  </div>
                ))}
              </div>
              
              {selectedDepartments.slice(0, 4).map((dept, deptIndex) => (
                <div key={dept} className="grid grid-cols-8 gap-2 mb-2">
                  <div className="text-xs font-medium text-gray-700 py-2 truncate">
                    {dept}
                  </div>
                  {[0, 1, 2, 3, 4, 5, 6].map(day => {
                    const dayShifts = optimizationResult.shifts.filter(
                      s => s.day === day && s.department?.toLowerCase() === dept.toLowerCase()
                    ).slice(0, 2);
                    
                    return (
                      <div key={day} className="space-y-1">
                        {dayShifts.map((shift, shiftIndex) => {
                          const confidenceColor = 
                            shift.confidence >= 0.8 ? 'bg-green-100 border-green-300 text-green-800' :
                            shift.confidence >= 0.6 ? 'bg-yellow-100 border-yellow-300 text-yellow-800' :
                            'bg-red-100 border-red-300 text-red-800';
                            
                          return (
                            <motion.div
                              key={shift.id}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: (deptIndex * 7 + day) * 0.05 }}
                              className={`text-xs p-2 rounded border ${confidenceColor} cursor-pointer hover:shadow-md transition-shadow`}
                              title={`${shift.employee_id}: ${shift.start_time}-${shift.end_time} (${Math.round(shift.confidence * 100)}% confidence)${shift.reason ? ' - ' + shift.reason : ''}`}
                            >
                              <div className="font-medium truncate">{shift.start_time}</div>
                              <div className="truncate">{shift.employee_id.replace('emp_', '')}</div>
                            </motion.div>
                          );
                        })}
                        {dayShifts.length === 0 && (
                          <div className="text-xs p-2 text-gray-400 text-center">
                            No shifts
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            
            {/* Detailed Table View */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Day
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time Slot
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      AI Reasoning
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {optimizationResult.shifts.slice(0, 15).map((shift, index) => {
                    const confidenceColor = 
                      shift.confidence >= 0.8 ? 'text-green-600' :
                      shift.confidence >= 0.6 ? 'text-yellow-600' :
                      'text-red-600';
                      
                    return (
                      <motion.tr 
                        key={shift.id} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][shift.day]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {shift.department}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                          {shift.start_time} - {shift.end_time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                              <span className="text-xs font-medium">
                                {shift.employee_id.replace('emp_', '')}
                              </span>
                            </div>
                            <span>{shift.employee_id}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  shift.confidence >= 0.8 ? 'bg-green-500' :
                                  shift.confidence >= 0.6 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${shift.confidence * 100}%` }}
                              ></div>
                            </div>
                            <span className={`text-sm font-medium ${confidenceColor}`}>
                              {Math.round(shift.confidence * 100)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                          <span className="line-clamp-2">
                            {shift.reason || 'Optimized based on demand forecast and employee availability'}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {optimizationResult.shifts.length > 15 && (
              <div className="mt-4 text-center">
                <button className="text-sm text-cdp-blue hover:text-cdp-dark font-medium">
                  View all {optimizationResult.total_shifts} shifts →
                </button>
              </div>
            )}
          </div>

          {/* AI Decision Insights */}
          {useCrewAI && agentUpdates.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-semibold mb-4">AI Decision Process</h2>
              
              <div className="space-y-4">
                {agentUpdates.slice(-5).map((update, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {update.agent} Agent
                        </h4>
                        <span className="text-xs text-gray-500">
                          {update.timestamp ? new Date(update.timestamp).toLocaleTimeString() : 'now'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{update.decision}</p>
                      {update.confidence && (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Confidence:</span>
                          <div className="w-20 bg-gray-200 rounded-full h-1">
                            <div 
                              className="bg-blue-500 h-1 rounded-full" 
                              style={{ width: `${update.confidence * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium text-blue-600">
                            {Math.round(update.confidence * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {agentUpdates.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>AI agents will share their decision-making process here during optimization.</p>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Enhanced Optimization Progress Indicator */}
      {isOptimizing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700 overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="p-2 bg-blue-500/20 rounded-lg"
                >
                  <Bot className="h-6 w-6 text-blue-400" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-bold text-white">AI Optimization in Progress</h3>
                  <p className="text-slate-400 text-sm">5 specialized agents collaborating on your schedule</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-mono font-bold text-white">{formatTime(elapsedTime)}</div>
                <div className="text-slate-400 text-xs">elapsed</div>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="px-6 py-4 border-b border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Overall Progress</span>
              <span className="text-sm font-medium text-white">
                {agentProgress.filter(a => a.status === 'completed').length} of 5 agents complete
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(agentProgress.filter(a => a.status === 'completed').length / 5) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          
          {/* Agent Status List */}
          <div className="px-6 py-4">
            <div className="space-y-3">
              {agentProgress.map((agent, index) => (
                <motion.div
                  key={agent.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center space-x-3 p-3 rounded-lg ${
                    agent.status === 'completed' ? 'bg-emerald-500/10 border border-emerald-500/30' :
                    agent.status === 'working' ? 'bg-blue-500/10 border border-blue-500/30' :
                    'bg-slate-800 border border-slate-700'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {agent.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                    ) : agent.status === 'working' ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <RefreshCw className="h-5 w-5 text-blue-400" />
                      </motion.div>
                    ) : (
                      <Clock className="h-5 w-5 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium ${
                      agent.status === 'completed' ? 'text-emerald-400' :
                      agent.status === 'working' ? 'text-blue-400' :
                      'text-slate-400'
                    }`}>
                      {agent.displayName}
                    </div>
                    <div className="text-sm text-slate-500 truncate">{agent.decision}</div>
                  </div>
                  <div className={`text-xs font-medium px-2 py-1 rounded ${
                    agent.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                    agent.status === 'working' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-slate-700 text-slate-500'
                  }`}>
                    {agent.status === 'completed' ? 'Done' :
                     agent.status === 'working' ? 'Working...' :
                     'Waiting'}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Did You Know Fact */}
          <div className="px-6 py-4 border-t border-slate-700 bg-slate-800/50">
            <div className="flex items-start space-x-3">
              <Lightbulb className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Did you know?</div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentFactIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm text-slate-300"
                  >
                    {optimizationFacts[currentFactIndex]}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SchedulingDashboard;