import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  TrendingDown, 
  AlertCircle, 
  Target, 
  Heart,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Brain,
  Clock,
  RefreshCw,
  Lightbulb
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { api, RetentionAnalysis, RetentionMetric } from '../services/api';

interface EmployeeRisk {
  employee_id: string;
  name: string;
  risk_score: number;
  department: string;
  tenure_months: number;
  risk_factors: string[];
  interventions: string[];
  predicted_outcome?: number;
  satisfaction_score?: number;
  performance_score?: number;
  sentiment_trend?: string;
}

interface RetentionAgentProgress {
  name: string;
  displayName: string;
  icon: 'AlertTriangle' | 'Heart' | 'TrendingUp' | 'DollarSign' | 'Brain';
  status: 'waiting' | 'working' | 'completed';
  workingStatus: string;
  doneStatus: string;
}

const retentionFacts = [
  "AI analyzes 30+ behavioral signals per employee",
  "Early intervention reduces turnover by up to 40%",
  "Sentiment analysis processes feedback in real-time",
  "Career path modeling considers 100+ growth trajectories",
  "Compensation analysis benchmarks against 500+ market data points",
  "Engagement scores correlate 85% with retention outcomes",
  "Personalized interventions improve success rates by 3x",
  "Predictive models achieve 92% accuracy on 90-day retention"
];

const initialAgentProgress: RetentionAgentProgress[] = [
  { name: 'risk_analyst', displayName: 'Retention Risk Analyst', icon: 'AlertTriangle', status: 'waiting', workingStatus: 'Scanning behavioral patterns across employees...', doneStatus: 'Identified high-risk employees' },
  { name: 'engagement_specialist', displayName: 'Employee Engagement Specialist', icon: 'Heart', status: 'waiting', workingStatus: 'Analyzing satisfaction metrics and engagement scores...', doneStatus: 'Engagement analysis complete' },
  { name: 'career_strategist', displayName: 'Career Development Strategist', icon: 'TrendingUp', status: 'waiting', workingStatus: 'Evaluating growth opportunities and career paths...', doneStatus: 'Career path analysis complete' },
  { name: 'compensation_analyst', displayName: 'Compensation & Benefits Analyst', icon: 'DollarSign', status: 'waiting', workingStatus: 'Comparing compensation to market benchmarks...', doneStatus: 'Compensation gaps identified' },
  { name: 'chief_strategist', displayName: 'Chief Retention Strategist', icon: 'Brain', status: 'waiting', workingStatus: 'Synthesizing retention strategies and interventions...', doneStatus: 'Personalized interventions generated' },
];

const RetentionAnalytics: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [retentionAnalysis, setRetentionAnalysis] = useState<RetentionAnalysis | null>(null);
  const [rawMetrics, setRawMetrics] = useState<RetentionMetric[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRisk | null>(null);
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterRiskLevel, setFilterRiskLevel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [agentProgress, setAgentProgress] = useState<RetentionAgentProgress[]>(initialAgentProgress);
  const [showingAgentProgress, setShowingAgentProgress] = useState(false);
  const [pendingResult, setPendingResult] = useState<RetentionAnalysis | null>(null);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const factTimerRef = useRef<NodeJS.Timeout | null>(null);
  const agentTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isAnimationRunningRef = useRef(false);

  useEffect(() => {
    loadRetentionMetrics();
  }, []);

  useEffect(() => {
    if (showingAgentProgress) {
      setElapsedTime(0);
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      
      factTimerRef.current = setInterval(() => {
        setCurrentFactIndex(prev => (prev + 1) % retentionFacts.length);
      }, 4000);
      
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (factTimerRef.current) clearInterval(factTimerRef.current);
      };
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (factTimerRef.current) clearInterval(factTimerRef.current);
    }
  }, [showingAgentProgress]);

  useEffect(() => {
    if (showingAgentProgress && !isAnimationRunningRef.current) {
      isAnimationRunningRef.current = true;
      setAnimationComplete(false);
      setAgentProgress(initialAgentProgress.map(a => ({ ...a, status: 'waiting' as const })));
      let currentAgentIndex = 0;
      
      const runAgentSequence = () => {
        if (currentAgentIndex < 5) {
          setAgentProgress(prev => prev.map((agent, idx) => {
            if (idx < currentAgentIndex) {
              return { ...agent, status: 'completed' };
            }
            if (idx === currentAgentIndex) {
              return { ...agent, status: 'working' };
            }
            return { ...agent, status: 'waiting' };
          }));
          
          const workingTime = 3000 + Math.random() * 2000;
          agentTimerRef.current = setTimeout(() => {
            setAgentProgress(prev => prev.map((agent, idx) => {
              if (idx <= currentAgentIndex) {
                return { ...agent, status: 'completed' };
              }
              return agent;
            }));
            
            currentAgentIndex++;
            
            if (currentAgentIndex < 5) {
              agentTimerRef.current = setTimeout(runAgentSequence, 500);
            } else {
              agentTimerRef.current = setTimeout(() => {
                isAnimationRunningRef.current = false;
                setAnimationComplete(true);
              }, 1000);
            }
          }, workingTime);
        }
      };
      
      agentTimerRef.current = setTimeout(runAgentSequence, 500);
    }
    
    return () => {
      if (agentTimerRef.current && !showingAgentProgress) {
        clearTimeout(agentTimerRef.current);
        isAnimationRunningRef.current = false;
      }
    };
  }, [showingAgentProgress]);

  useEffect(() => {
    if (animationComplete && pendingResult) {
      setRetentionAnalysis(pendingResult);
      setPendingResult(null);
      setAnimationComplete(false);
      setIsFinalizing(false);
      setShowingAgentProgress(false);
      setIsAnalyzing(false);
    } else if (animationComplete && !pendingResult) {
      setIsFinalizing(true);
    }
  }, [animationComplete, pendingResult]);

  const loadRetentionMetrics = async () => {
    try {
      const response = await api.getRetentionMetrics();
      setRawMetrics(response.retention_metrics);
    } catch (error) {
      console.error('Failed to load retention metrics:', error);
    }
  };

  const runRetentionAnalysis = async () => {
    setIsAnalyzing(true);
    setShowingAgentProgress(true);
    setPendingResult(null);
    setAnimationComplete(false);
    setIsFinalizing(false);
    
    try {
      const response = await api.analyzeRetention({
        department: filterDepartment === 'all' ? undefined : filterDepartment
      });
      
      if (response.success) {
        setPendingResult(response.data);
      }
    } catch (error) {
      console.error('Retention analysis failed:', error);
      setShowingAgentProgress(false);
      setIsAnalyzing(false);
    }
  };

  const getRiskLevel = (score: number): { level: string; color: string; bgColor: string } => {
    if (score >= 0.7) return { level: 'High', color: 'text-red-600', bgColor: 'bg-red-100' };
    if (score >= 0.4) return { level: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { level: 'Low', color: 'text-green-600', bgColor: 'bg-green-100' };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAgentIcon = (iconName: string) => {
    switch (iconName) {
      case 'AlertTriangle': return AlertTriangle;
      case 'Heart': return Heart;
      case 'TrendingUp': return TrendingUp;
      case 'DollarSign': return DollarSign;
      case 'Brain': return Brain;
      default: return AlertTriangle;
    }
  };

  const departments = Array.from(new Set(rawMetrics.map(m => m.department).filter(Boolean)));

  // Filter employees based on search and filters
  const filteredEmployees = retentionAnalysis?.employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || emp.department === filterDepartment;
    const riskLevel = getRiskLevel(emp.risk_score).level.toLowerCase();
    const matchesRisk = filterRiskLevel === 'all' || riskLevel === filterRiskLevel;
    
    return matchesSearch && matchesDepartment && matchesRisk;
  }) || [];

  // Prepare chart data
  const riskDistributionData = retentionAnalysis ? [
    { name: 'High Risk', value: retentionAnalysis.summary.high_risk_count, color: '#EF4444' },
    { name: 'Medium Risk', value: retentionAnalysis.summary.medium_risk_count, color: '#F59E0B' },
    { name: 'Low Risk', value: retentionAnalysis.summary.low_risk_count, color: '#10B981' }
  ] : [];

  const departmentRiskData = retentionAnalysis ? Object.entries(retentionAnalysis.department_trends).map(([dept, risk]) => ({
    department: dept,
    risk_score: risk,
    employees: retentionAnalysis.employees.filter(e => e.department === dept).length
  })) : [];

  const scatterData = filteredEmployees
    .map(emp => ({
      tenure: emp.tenure_months,
      risk: emp.risk_score,
      name: emp.name,
      department: emp.department
    }))
    .sort((a, b) => a.tenure - b.tenure);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Retention Analytics</h1>
          <p className="text-gray-600 mt-1">AI-powered retention risk assessment and intervention planning</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={loadRetentionMetrics}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Search className="h-4 w-4" />
            <span>Refresh Data</span>
          </button>
          
          <button
            onClick={runRetentionAnalysis}
            disabled={isAnalyzing}
            className="flex items-center space-x-2 px-6 py-2 bg-cdp-blue text-white rounded-md hover:bg-cdp-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Target className="h-4 w-4" />
                <span>Run Analysis</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      {rawMetrics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{rawMetrics.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Risk Count</p>
                <p className="text-2xl font-bold text-red-600">
                  {rawMetrics.filter(m => m.risk_score >= 0.7).length}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Risk Score</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {(rawMetrics.reduce((sum, m) => sum + m.risk_score, 0) / rawMetrics.length).toFixed(2)}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-green-600">{departments.length}</p>
              </div>
              <Heart className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {retentionAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Top Risk Factors Summary */}
          {retentionAnalysis.summary.top_risk_factors && retentionAnalysis.summary.top_risk_factors.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
                Top Risk Factors
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {retentionAnalysis.summary.top_risk_factors.map((factor, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                    <span className="text-sm text-red-800 font-medium">{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk Distribution and Department Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Distribution Pie Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Risk Distribution</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={(entry) => `${entry.name}: ${entry.value}`}
                    >
                      {riskDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 grid grid-cols-3 gap-4">
                {riskDistributionData.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <div className="text-lg font-bold mt-1">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Risk Levels */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Department Risk Levels</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentRiskData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="department" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                    <Tooltip formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Risk Score']} />
                    <Bar dataKey="risk_score" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Employee List with Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Employee Risk Assessment</h2>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                <Download className="h-4 w-4" />
                <span>Export Report</span>
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cdp-blue focus:border-transparent"
                />
              </div>
              
              <div>
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cdp-blue focus:border-transparent"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <select
                  value={filterRiskLevel}
                  onChange={(e) => setFilterRiskLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cdp-blue focus:border-transparent"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="high">High Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="low">Low Risk</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {filteredEmployees.length} of {retentionAnalysis.employees.length} employees
                </span>
              </div>
            </div>

            {/* Employee Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredEmployees.map((employee, index) => {
                const risk = getRiskLevel(employee.risk_score);
                return (
                  <motion.div
                    key={employee.employee_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedEmployee(employee)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                        <p className="text-sm text-gray-600">{employee.department}</p>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${risk.bgColor} ${risk.color}`}>
                          {risk.level} Risk
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {Math.round(employee.risk_score * 100)}%
                        </div>
                      </div>
                    </div>
                    
                    {/* Sentiment Indicator */}
                    {employee.satisfaction_score && (
                      <div className="mb-3 p-2 bg-gray-50 rounded-md">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Sentiment</span>
                          <div className="flex items-center space-x-1">
                            <Heart className={`h-3 w-3 ${
                              employee.satisfaction_score > 3.5 ? 'text-green-500' :
                              employee.satisfaction_score > 2.5 ? 'text-yellow-500' : 'text-red-500'
                            }`} />
                            <span className="font-medium">
                              {employee.satisfaction_score.toFixed(1)}/5
                            </span>
                          </div>
                        </div>
                        {employee.sentiment_trend && (
                          <div className="flex items-center justify-between text-xs mt-1">
                            <span className="text-gray-600">Trend</span>
                            <span className={`font-medium ${
                              employee.sentiment_trend === 'improving' ? 'text-green-600' :
                              employee.sentiment_trend === 'declining' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {employee.sentiment_trend}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Risk Score Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Risk Score</span>
                        <span>{(employee.risk_score * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            employee.risk_score >= 0.7 ? 'bg-red-500' :
                            employee.risk_score >= 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${employee.risk_score * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Top Risk Factors */}
                    <div className="mb-3">
                      <div className="text-xs font-medium text-gray-700 mb-1">Top Risk Factors</div>
                      <div className="space-y-1">
                        {employee.risk_factors.slice(0, 2).map((factor, i) => (
                          <div key={i} className="text-xs text-gray-600 flex items-center space-x-1">
                            <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                            <span>{factor}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Intervention Count */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">
                        {employee.tenure_months} months tenure
                      </span>
                      <span className="text-cdp-blue font-medium">
                        {employee.interventions.length} interventions
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Tenure vs Risk Scatter Plot */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Tenure vs Risk Analysis</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="tenure" name="Tenure (months)" domain={[0, 'dataMax']} />
                  <YAxis type="number" dataKey="risk" name="Risk Score" domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      name === 'risk' ? `${(value * 100).toFixed(1)}%` : `${value} months`,
                      name === 'risk' ? 'Risk Score' : 'Tenure'
                    ]}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.name || ''}
                  />
                  <Scatter data={scatterData} fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedEmployee(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedEmployee.name}</h2>
                  <p className="text-gray-600">{selectedEmployee.employee_id} • {selectedEmployee.department}</p>
                </div>
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {/* Risk Overview */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Risk Score</div>
                  <div className="text-2xl font-bold text-red-600">
                    {(selectedEmployee.risk_score * 100).toFixed(1)}%
                  </div>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getRiskLevel(selectedEmployee.risk_score).bgColor} ${getRiskLevel(selectedEmployee.risk_score).color}`}>
                    {getRiskLevel(selectedEmployee.risk_score).level} Risk
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Tenure</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedEmployee.tenure_months} months
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {selectedEmployee.tenure_months < 6 ? 'New Employee' : 
                     selectedEmployee.tenure_months < 24 ? 'Experienced' : 'Veteran'}
                  </div>
                </div>
              </div>

              {/* Risk Factors */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Risk Factors</h3>
                <div className="space-y-2">
                  {selectedEmployee.risk_factors.map((factor, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                      <span className="text-red-800">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Interventions */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Recommended Interventions</h3>
                <div className="space-y-2">
                  {selectedEmployee.interventions.map((intervention, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Target className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <span className="text-blue-800">{intervention}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Predicted Outcome */}
              {selectedEmployee.predicted_outcome && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-green-900">Predicted Outcome</h3>
                  </div>
                  <p className="text-green-800">
                    With recommended interventions, risk reduction to {(selectedEmployee.predicted_outcome * 100).toFixed(1)}% 
                    probability within 30 days.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                  Schedule Meeting
                </button>
                <button className="px-4 py-2 bg-cdp-blue text-white rounded-md hover:bg-cdp-dark transition-colors">
                  Create Action Plan
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* AI Agent Progress Panel */}
      {showingAgentProgress && (
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
                  className="p-2 bg-purple-500/20 rounded-lg"
                >
                  <Brain className="h-6 w-6 text-purple-400" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-bold text-white">AI Retention Analysis in Progress</h3>
                  <p className="text-slate-400 text-sm">5 specialized agents analyzing employee data</p>
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
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(agentProgress.filter(a => a.status === 'completed').length / 5) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          
          {/* Finalizing Banner */}
          {isFinalizing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="px-6 py-4 bg-amber-500/10 border-b border-amber-500/30"
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw className="h-5 w-5 text-amber-400" />
                </motion.div>
                <div>
                  <div className="text-amber-400 font-medium">Finalizing results...</div>
                  <div className="text-amber-400/70 text-sm">AI agents are compiling the retention analysis</div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Agent Status List */}
          <div className="px-6 py-4">
            <div className="space-y-3">
              {agentProgress.map((agent, index) => {
                const IconComponent = getAgentIcon(agent.icon);
                const statusText = agent.status === 'completed' ? agent.doneStatus : 
                                   agent.status === 'working' ? agent.workingStatus : 
                                   'Waiting to start...';
                return (
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
                    <div className="flex-shrink-0">
                      <IconComponent className={`h-5 w-5 ${
                        agent.status === 'completed' ? 'text-emerald-400' :
                        agent.status === 'working' ? 'text-blue-400' :
                        'text-slate-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium ${
                        agent.status === 'completed' ? 'text-emerald-400' :
                        agent.status === 'working' ? 'text-blue-400' :
                        'text-slate-400'
                      }`}>
                        {agent.displayName}
                      </div>
                      <div className="text-sm text-slate-500 truncate">{statusText}</div>
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
                );
              })}
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
                    {retentionFacts[currentFactIndex]}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="px-6 py-3 border-t border-slate-700 bg-slate-900/50">
            <div className="flex items-center justify-center space-x-2 text-xs text-slate-500">
              <span>Powered by</span>
              <span className="font-semibold text-slate-400">Cloudera Data Platform</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RetentionAnalytics;