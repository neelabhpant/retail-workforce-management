import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  XCircle
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
}

const RetentionAnalytics: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [retentionAnalysis, setRetentionAnalysis] = useState<RetentionAnalysis | null>(null);
  const [rawMetrics, setRawMetrics] = useState<RetentionMetric[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRisk | null>(null);
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterRiskLevel, setFilterRiskLevel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRetentionMetrics();
  }, []);

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
    
    try {
      const response = await api.analyzeRetention({
        department: filterDepartment === 'all' ? undefined : filterDepartment
      });
      
      if (response.success) {
        setRetentionAnalysis(response.data);
      }
    } catch (error) {
      console.error('Retention analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskLevel = (score: number): { level: string; color: string; bgColor: string } => {
    if (score >= 0.7) return { level: 'High', color: 'text-red-600', bgColor: 'bg-red-100' };
    if (score >= 0.4) return { level: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { level: 'Low', color: 'text-green-600', bgColor: 'bg-green-100' };
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

  const scatterData = filteredEmployees.map(emp => ({
    tenure: emp.tenure_months,
    risk: emp.risk_score,
    name: emp.name,
    department: emp.department
  }));

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
                <ScatterChart data={scatterData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tenure" name="Tenure (months)" />
                  <YAxis dataKey="risk" name="Risk Score" domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      name === 'risk' ? `${(value * 100).toFixed(1)}%` : `${value} months`,
                      name === 'risk' ? 'Risk Score' : 'Tenure'
                    ]}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.name || ''}
                  />
                  <Scatter dataKey="risk" fill="#8884d8" />
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

      {/* Loading State */}
      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center"
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cdp-blue"></div>
            <h3 className="text-lg font-medium text-gray-900">Analyzing Employee Retention</h3>
            <p className="text-gray-600 max-w-md">
              AI agents are analyzing employee data, performance metrics, and behavioral patterns 
              to identify retention risks and generate personalized intervention strategies.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RetentionAnalytics;