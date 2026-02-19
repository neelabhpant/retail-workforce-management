import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  FileText,
  Download,
  Users,
  Target,
  Activity,
  Zap
} from 'lucide-react';
import { api } from '../services/api';

interface ExecutiveSummaryData {
  overallHealth: {
    score: number;
    trend: number;
    trendDirection: 'up' | 'down' | 'stable';
  };
  costAtRisk: {
    amount: number;
    breakdown: {
      turnoverCost: number;
      productivityLoss: number;
      recruitmentCost: number;
    };
  };
  topIssues: Array<{
    id: string;
    description: string;
    affectedCount: number;
    severity: 'critical' | 'high' | 'medium';
    department?: string;
  }>;
  quickWins: Array<{
    id: string;
    action: string;
    estimatedImpact: string;
    timeToImplement: string;
    owner?: string;
  }>;
  keyMetrics: {
    totalEmployees: number;
    avgSentiment: number;
    highRiskCount: number;
    schedulingEfficiency: number;
    learningEngagement: number;
  };
}

const ExecutiveSummary: React.FC = () => {
  const [summaryData, setSummaryData] = useState<ExecutiveSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    loadSummaryData();
  }, [timeframe]);

  const loadSummaryData = async () => {
    try {
      setLoading(true);
      // Mock data until backend is ready
      const mockData: ExecutiveSummaryData = {
        overallHealth: {
          score: 72,
          trend: -3,
          trendDirection: 'down'
        },
        costAtRisk: {
          amount: 450000,
          breakdown: {
            turnoverCost: 300000,
            productivityLoss: 100000,
            recruitmentCost: 50000
          }
        },
        topIssues: [
          { 
            id: '1', 
            description: 'Electronics department overtime exceeding limits', 
            affectedCount: 12, 
            severity: 'critical',
            department: 'Electronics'
          },
          { 
            id: '2', 
            description: 'Career stagnation in mid-level positions', 
            affectedCount: 28, 
            severity: 'high',
            department: 'Multiple'
          },
          { 
            id: '3', 
            description: 'Manager communication gaps identified', 
            affectedCount: 15, 
            severity: 'high',
            department: 'Sales Floor'
          },
          {
            id: '4',
            description: 'New hire onboarding satisfaction declining',
            affectedCount: 8,
            severity: 'medium',
            department: 'All'
          }
        ],
        quickWins: [
          { 
            id: '1', 
            action: 'Adjust Electronics schedules', 
            estimatedImpact: '+8% sentiment, $12K saved',
            timeToImplement: '2 days',
            owner: 'Operations Manager'
          },
          { 
            id: '2', 
            action: 'Launch mentoring program', 
            estimatedImpact: '+15% retention',
            timeToImplement: '1 week',
            owner: 'HR Director'
          },
          { 
            id: '3', 
            action: 'Manager training workshop', 
            estimatedImpact: '+10% team satisfaction',
            timeToImplement: '3 days',
            owner: 'L&D Team'
          },
          {
            id: '4',
            action: 'Implement buddy system for new hires',
            estimatedImpact: '+20% onboarding satisfaction',
            timeToImplement: '1 week',
            owner: 'HR Team'
          }
        ],
        keyMetrics: {
          totalEmployees: 487,
          avgSentiment: 68.5,
          highRiskCount: 23,
          schedulingEfficiency: 82,
          learningEngagement: 71
        }
      };
      
      setSummaryData(mockData);
      
      // Will be replaced with:
      // const response = await api.getExecutiveSummary(timeframe);
      // setSummaryData(response.data);
    } catch (error) {
      console.error('Failed to load executive summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToPowerPoint = async () => {
    // Implement export functionality
    console.log('Exporting to PowerPoint...');
    // Would call: await api.exportExecutiveSummary('ppt', timeframe);
  };

  const exportToPDF = async () => {
    // Implement export functionality
    console.log('Exporting to PDF...');
    // Would call: await api.exportExecutiveSummary('pdf', timeframe);
  };

  const getHealthColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cdp-blue"></div>
      </div>
    );
  }

  if (!summaryData) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Executive Dashboard</h1>
          <p className="text-gray-600 mt-1">High-level workforce sentiment and operational metrics</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Timeframe selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['week', 'month', 'quarter'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-3 py-1 rounded-md capitalize transition-colors ${
                  timeframe === period
                    ? 'bg-white text-cdp-blue shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Executive Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-cdp-blue via-blue-600 to-cdp-dark rounded-xl shadow-2xl p-8 text-white"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Zap className="h-6 w-6" />
            <span>Workforce Sentiment Executive Summary</span>
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={exportToPDF}
              className="px-3 py-1 bg-white/20 rounded hover:bg-white/30 transition-colors flex items-center space-x-1"
            >
              <FileText className="h-4 w-4" />
              <span className="text-sm">PDF</span>
            </button>
            <button
              onClick={exportToPowerPoint}
              className="px-3 py-1 bg-white/20 rounded hover:bg-white/30 transition-colors flex items-center space-x-1"
            >
              <Download className="h-4 w-4" />
              <span className="text-sm">PowerPoint</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Overall Health Score */}
          <div>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <svg className="w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="white"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56 * summaryData.overallHealth.score / 100} ${2 * Math.PI * 56}`}
                    strokeLinecap="round"
                    transform="rotate(-90 64 64)"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold">{summaryData.overallHealth.score}</span>
                  <span className="text-xs opacity-75">Health Score</span>
                </div>
              </div>
              
              <div>
                <p className="text-sm opacity-75 mb-1">Trend</p>
                <div className="flex items-center space-x-2">
                  {summaryData.overallHealth.trendDirection === 'up' ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                  <span className="text-2xl font-bold">
                    {Math.abs(summaryData.overallHealth.trend)}%
                  </span>
                </div>
                <p className="text-xs opacity-75 mt-1">vs. last {timeframe}</p>
              </div>
            </div>
          </div>

          {/* Cost at Risk */}
          <div className="text-right">
            <p className="text-sm opacity-75 mb-2">Cost at Risk</p>
            <p className="text-4xl font-bold mb-4">
              ${(summaryData.costAtRisk.amount / 1000).toFixed(0)}K
            </p>
            <div className="space-y-1 text-xs opacity-75">
              <div className="flex justify-between">
                <span>Turnover:</span>
                <span>${(summaryData.costAtRisk.breakdown.turnoverCost / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between">
                <span>Productivity:</span>
                <span>${(summaryData.costAtRisk.breakdown.productivityLoss / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between">
                <span>Recruitment:</span>
                <span>${(summaryData.costAtRisk.breakdown.recruitmentCost / 1000).toFixed(0)}K</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          {/* Top Issues */}
          <div>
            <h3 className="font-semibold mb-4 text-sm opacity-90 flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Top Issues</span>
            </h3>
            <div className="space-y-3">
              {summaryData.topIssues.slice(0, 3).map((issue, index) => (
                <div key={issue.id} className="flex items-start space-x-2">
                  <span className="text-yellow-300 mt-0.5">
                    {issue.severity === 'critical' ? '🔴' : issue.severity === 'high' ? '🟠' : '🟡'}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm leading-tight">{index + 1}. {issue.description}</p>
                    <p className="text-xs opacity-75 mt-1">
                      {issue.affectedCount} employees • {issue.department}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Wins */}
          <div>
            <h3 className="font-semibold mb-4 text-sm opacity-90 flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Quick Wins</span>
            </h3>
            <div className="space-y-3">
              {summaryData.quickWins.slice(0, 3).map((win, index) => (
                <div key={win.id} className="flex items-start space-x-2">
                  <span className="text-green-300 mt-0.5">✓</span>
                  <div className="flex-1">
                    <p className="text-sm leading-tight">{index + 1}. {win.action}</p>
                    <p className="text-xs opacity-75 mt-1">
                      {win.estimatedImpact} • {win.timeToImplement}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-6 border-t border-white/20">
          <button className="px-6 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>View Detailed Report</span>
          </button>
          <button className="px-6 py-2 bg-white text-cdp-blue rounded-lg hover:bg-gray-100 transition-colors font-semibold">
            Take Action
          </button>
        </div>
      </motion.div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <Users className="h-5 w-5 text-gray-400" />
            <span className="text-xs text-gray-500">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{summaryData.keyMetrics.totalEmployees}</p>
          <p className="text-xs text-gray-600">Employees</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <Activity className="h-5 w-5 text-gray-400" />
            <span className="text-xs text-gray-500">Average</span>
          </div>
          <p className={`text-2xl font-bold ${getHealthColor(summaryData.keyMetrics.avgSentiment)}`}>
            {summaryData.keyMetrics.avgSentiment.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-600">Sentiment</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="h-5 w-5 text-gray-400" />
            <span className="text-xs text-gray-500">High Risk</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{summaryData.keyMetrics.highRiskCount}</p>
          <p className="text-xs text-gray-600">Employees</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <Target className="h-5 w-5 text-gray-400" />
            <span className="text-xs text-gray-500">Efficiency</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{summaryData.keyMetrics.schedulingEfficiency}%</p>
          <p className="text-xs text-gray-600">Scheduling</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <Zap className="h-5 w-5 text-gray-400" />
            <span className="text-xs text-gray-500">Engagement</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{summaryData.keyMetrics.learningEngagement}%</p>
          <p className="text-xs text-gray-600">Learning</p>
        </motion.div>
      </div>

      {/* Detailed Issues List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Detail & Action Plan</h3>
        <div className="space-y-3">
          {summaryData.topIssues.map((issue) => (
            <div key={issue.id} className={`p-4 rounded-lg border ${getSeverityColor(issue.severity)}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{issue.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm">
                    <span className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{issue.affectedCount} affected</span>
                    </span>
                    <span>{issue.department}</span>
                    <span className="capitalize font-medium">{issue.severity} priority</span>
                  </div>
                </div>
                <button className="px-3 py-1 bg-white rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ExecutiveSummary;