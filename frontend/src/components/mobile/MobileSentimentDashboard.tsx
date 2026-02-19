import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  ChevronRight,
  ChevronDown,
  Users,
  Clock,
  MessageSquare,
  Activity,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import MobileAppShell from './MobileAppShell';

interface DepartmentSentiment {
  name: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  employeeCount: number;
  topIssue?: string;
}

interface ActionItem {
  id: string;
  priority: 'critical' | 'high' | 'medium';
  type: string;
  title: string;
  target: string;
  impact: string;
  timeRequired: string;
}

const MobileSentimentDashboard: React.FC = () => {
  const [expandedDept, setExpandedDept] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const overallScore = 72;
  const scoreTrend = -3;

  const departments: DepartmentSentiment[] = [
    { name: 'Electronics', score: 35, trend: 'down', change: -12, employeeCount: 12, topIssue: 'Excessive overtime' },
    { name: 'Sales Floor', score: 68, trend: 'down', change: -4, employeeCount: 28, topIssue: 'Career stagnation' },
    { name: 'Customer Service', score: 87, trend: 'up', change: 7, employeeCount: 15 },
    { name: 'Inventory', score: 70, trend: 'up', change: 5, employeeCount: 18 },
    { name: 'Pharmacy', score: 84, trend: 'down', change: -2, employeeCount: 8, topIssue: 'Seasonal workload' },
  ];

  const actionItems: ActionItem[] = [
    {
      id: '1',
      priority: 'critical',
      type: 'meeting',
      title: 'Urgent 1-on-1 Required',
      target: 'James Wilson • Electronics Lead',
      impact: '+25% sentiment',
      timeRequired: '30 min'
    },
    {
      id: '2',
      priority: 'high',
      type: 'review',
      title: 'Review Schedule',
      target: 'Electronics Department',
      impact: '$12K saved',
      timeRequired: '2 hours'
    },
    {
      id: '3',
      priority: 'high',
      type: 'intervention',
      title: 'Career Discussion',
      target: 'Sarah Chen • Sales Associate',
      impact: '+15% retention',
      timeRequired: '1 hour'
    },
  ];

  const getScoreColor = (score: number) => {
    if (score < 40) return 'text-red-600';
    if (score < 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getScoreBg = (score: number) => {
    if (score < 40) return 'bg-red-500';
    if (score < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-50 border-l-4 border-red-500';
      case 'high': return 'bg-orange-50 border-l-4 border-orange-500';
      default: return 'bg-yellow-50 border-l-4 border-yellow-500';
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <MobileAppShell activeTab="sentiment">
      <div className="p-4 space-y-4">
        
        {/* Pull to Refresh Indicator */}
        <button 
          onClick={handleRefresh}
          className="w-full flex items-center justify-center py-2 text-gray-400 text-sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Pull to refresh'}
        </button>

        {/* Overall Health Score Card */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-[#0071ce]" />
              <span className="text-sm font-medium text-gray-600">AI Health Score</span>
            </div>
            <span className="text-xs text-gray-400">Updated 5 min ago</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline space-x-2">
                <span className={`text-5xl font-bold ${getScoreColor(overallScore)}`}>
                  {overallScore}
                </span>
                <span className="text-gray-400 text-lg">/100</span>
              </div>
              <div className="flex items-center mt-2">
                {scoreTrend < 0 ? (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                )}
                <span className={scoreTrend < 0 ? 'text-red-500' : 'text-green-500'}>
                  {Math.abs(scoreTrend)}% this month
                </span>
              </div>
            </div>
            
            {/* Mini gauge */}
            <div className="relative w-24 h-24">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke={overallScore < 40 ? '#ef4444' : overallScore < 70 ? '#eab308' : '#22c55e'}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40 * overallScore / 100} ${2 * Math.PI * 40}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">
                  {overallScore < 40 ? '😟' : overallScore < 70 ? '😐' : '😊'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex justify-around mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">81</p>
              <p className="text-xs text-gray-500">Employees</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-red-600">3</p>
              <p className="text-xs text-gray-500">High Risk</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-[#0071ce]">5</p>
              <p className="text-xs text-gray-500">Actions</p>
            </div>
          </div>
        </div>

        {/* Priority Actions */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Priority Actions</h2>
            <span className="text-xs text-[#0071ce] font-medium">View All</span>
          </div>

          <div className="space-y-3">
            {actionItems.map((item, index) => (
              <div 
                key={item.id}
                className={`p-3 rounded-xl ${getPriorityStyles(item.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-xs font-bold uppercase ${
                        item.priority === 'critical' ? 'text-red-600' : 'text-orange-600'
                      }`}>
                        #{index + 1} {item.priority}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{item.target}</p>
                    <div className="flex items-center space-x-3 mt-2">
                      <span className="text-xs text-green-600 font-medium">{item.impact}</span>
                      <span className="text-xs text-gray-400 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {item.timeRequired}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-semibold text-gray-900 mb-3">Department Breakdown</h2>
          
          <div className="space-y-2">
            {departments.map((dept) => (
              <div key={dept.name}>
                <button
                  onClick={() => setExpandedDept(expandedDept === dept.name ? null : dept.name)}
                  className="w-full p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getScoreBg(dept.score)}`}>
                        {dept.score}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{dept.name}</p>
                        <p className="text-xs text-gray-500">{dept.employeeCount} employees</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`flex items-center ${
                        dept.trend === 'up' ? 'text-green-500' : dept.trend === 'down' ? 'text-red-500' : 'text-gray-400'
                      }`}>
                        {dept.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : dept.trend === 'down' ? (
                          <TrendingDown className="h-4 w-4" />
                        ) : null}
                        <span className="text-xs ml-1">{Math.abs(dept.change)}%</span>
                      </div>
                      {expandedDept === dept.name ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded Details */}
                {expandedDept === dept.name && (
                  <div className="mt-2 ml-4 p-3 bg-gray-50 rounded-xl border-l-2 border-[#0071ce]">
                    {dept.topIssue && (
                      <div className="flex items-start space-x-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-gray-700">Top Issue</p>
                          <p className="text-sm text-gray-900">{dept.topIssue}</p>
                        </div>
                      </div>
                    )}
                    <button className="w-full mt-2 py-2 bg-[#0071ce] text-white text-sm font-medium rounded-lg">
                      View Details
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CDP Powered Badge */}
        <div className="flex items-center justify-center py-4 text-gray-400">
          <Activity className="h-4 w-4 mr-2" />
          <span className="text-xs">Powered by Cloudera Data Platform</span>
        </div>

      </div>
    </MobileAppShell>
  );
};

export default MobileSentimentDashboard;
