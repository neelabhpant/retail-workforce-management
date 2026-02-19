import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown,
  Users,
  MessageSquare,
  CheckCircle,
  Clock,
  ArrowRight,
  Activity,
  Target,
  Brain,
  RefreshCw,
  Lightbulb,
  Search,
  Zap
} from 'lucide-react';
import { api } from '../services/api';

interface SentimentData {
  department: string;
  weeklyScores: number[];
  trend: 'up' | 'down' | 'stable';
  currentScore: number;
}

interface ActionItem {
  id: string;
  priority: number;
  type: 'meeting' | 'review' | 'intervention' | 'training';
  target: string;
  targetRole?: string;
  department?: string;
  action: string;
  confidence: number;
  estimatedImpact: {
    sentimentImprovement: number;
    costSaving: number;
    timeRequired: string;
  };
  status: 'pending' | 'in_progress' | 'completed';
}

interface CellInsight {
  department: string;
  week: number;
  score: number;
  analysis: string;
  rootCauses: string[];
  recommendations: Array<{
    action: string;
    impact: string;
    urgency: 'high' | 'medium' | 'low';
  }>;
  affectedEmployees: number;
  riskLevel: 'critical' | 'warning' | 'healthy';
  aiGenerated?: boolean;
}

interface SentimentAgentProgress {
  name: string;
  displayName: string;
  icon: 'Search' | 'AlertCircle' | 'Zap';
  status: 'waiting' | 'working' | 'completed';
  workingStatus: string;
  doneStatus: string;
}

const sentimentFacts = [
  "AI analyzes communication patterns, workload, and feedback",
  "Early sentiment detection reduces turnover by up to 35%",
  "Department-level analysis identifies systemic issues",
  "Real-time insights enable proactive interventions",
  "Sentiment trends correlate 89% with retention outcomes"
];

const initialAgentProgress: SentimentAgentProgress[] = [
  { name: 'sentiment_analyst', displayName: 'Sentiment Analyst', icon: 'Search', status: 'waiting', workingStatus: 'Analyzing department sentiment patterns...', doneStatus: 'Sentiment analysis complete' },
  { name: 'root_cause_analyzer', displayName: 'Root Cause Analyzer', icon: 'AlertCircle', status: 'waiting', workingStatus: 'Identifying underlying factors...', doneStatus: 'Root causes identified' },
  { name: 'strategy_generator', displayName: 'Strategy Generator', icon: 'Zap', status: 'waiting', workingStatus: 'Generating intervention recommendations...', doneStatus: 'Recommendations ready' },
  { name: 'finalizer', displayName: 'Finalizing Results', icon: 'Zap', status: 'waiting', workingStatus: 'Preparing your analysis results...', doneStatus: 'Results ready' },
];

const SentimentDashboard: React.FC = () => {
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [actionQueue, setActionQueue] = useState<ActionItem[]>([]);
  const [selectedCell, setSelectedCell] = useState<{ dept: string; week: number } | null>(null);
  const [cellInsight, setCellInsight] = useState<CellInsight | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAgentProgress, setShowAgentProgress] = useState(false);
  const [agentProgress, setAgentProgress] = useState<SentimentAgentProgress[]>(initialAgentProgress);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [pendingResult, setPendingResult] = useState<CellInsight | null>(null);
  const [animationComplete, setAnimationComplete] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const factTimerRef = useRef<NodeJS.Timeout | null>(null);
  const agentTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isAnimationRunningRef = useRef(false);

  // Time periods for the heat map
  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  
  useEffect(() => {
    loadSentimentData();
    loadActionQueue();
  }, []);

  useEffect(() => {
    if (showAgentProgress) {
      setElapsedTime(0);
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      
      factTimerRef.current = setInterval(() => {
        setCurrentFactIndex(prev => (prev + 1) % sentimentFacts.length);
      }, 4000);
      
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (factTimerRef.current) clearInterval(factTimerRef.current);
      };
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (factTimerRef.current) clearInterval(factTimerRef.current);
    }
  }, [showAgentProgress]);

  useEffect(() => {
    if (showAgentProgress && !isAnimationRunningRef.current) {
      isAnimationRunningRef.current = true;
      setAnimationComplete(false);
      setAgentProgress(initialAgentProgress.map(a => ({ ...a, status: 'waiting' as const })));
      let currentAgentIndex = 0;
      
      const runAgentSequence = () => {
        if (currentAgentIndex < 4) {
          setAgentProgress(prev => prev.map((agent, idx) => {
            if (idx < currentAgentIndex) {
              return { ...agent, status: 'completed' };
            }
            if (idx === currentAgentIndex) {
              return { ...agent, status: 'working' };
            }
            return { ...agent, status: 'waiting' };
          }));
          
          const workingTime = currentAgentIndex === 3 ? 2000 + Math.random() * 1500 : 3000 + Math.random() * 2000;
          agentTimerRef.current = setTimeout(() => {
            setAgentProgress(prev => prev.map((agent, idx) => {
              if (idx <= currentAgentIndex) {
                return { ...agent, status: 'completed' };
              }
              return agent;
            }));
            
            currentAgentIndex++;
            
            if (currentAgentIndex < 4) {
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
      if (agentTimerRef.current && !showAgentProgress) {
        clearTimeout(agentTimerRef.current);
        isAnimationRunningRef.current = false;
      }
    };
  }, [showAgentProgress]);

  useEffect(() => {
    if (animationComplete && pendingResult) {
      setCellInsight(pendingResult);
      setPendingResult(null);
      setAnimationComplete(false);
      setShowAgentProgress(false);
      setLoadingInsight(false);
    }
  }, [animationComplete, pendingResult]);

  const loadSentimentData = async () => {
    try {
      setLoading(true);
      // For now, using mock data until backend endpoint is ready
      const mockData: SentimentData[] = [
        { department: 'Sales Floor', weeklyScores: [72, 75, 70, 68], trend: 'down', currentScore: 68 },
        { department: 'Electronics', weeklyScores: [45, 42, 38, 35], trend: 'down', currentScore: 35 },
        { department: 'Customer Service', weeklyScores: [80, 82, 85, 87], trend: 'up', currentScore: 87 },
        { department: 'Inventory', weeklyScores: [65, 68, 67, 70], trend: 'up', currentScore: 70 },
        { department: 'Pharmacy', weeklyScores: [88, 86, 85, 84], trend: 'down', currentScore: 84 },
      ];
      setSentimentData(mockData);
      
      // Will be replaced with:
      // const response = await api.getSentimentHeatmap('month');
      // setSentimentData(response.data);
    } catch (error) {
      console.error('Failed to load sentiment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActionQueue = async () => {
    try {
      // Mock action items until backend is ready
      const mockActions: ActionItem[] = [
        {
          id: '1',
          priority: 92,
          type: 'meeting',
          target: 'James Wilson',
          targetRole: 'Electronics Lead',
          department: 'Electronics',
          action: 'Urgent 1-on-1: Address burnout concerns',
          confidence: 92,
          estimatedImpact: {
            sentimentImprovement: 25,
            costSaving: 45000,
            timeRequired: '30 min'
          },
          status: 'pending'
        },
        {
          id: '2',
          priority: 85,
          type: 'review',
          target: 'Electronics Department',
          department: 'Electronics',
          action: 'Review scheduling - excessive overtime detected',
          confidence: 88,
          estimatedImpact: {
            sentimentImprovement: 20,
            costSaving: 12000,
            timeRequired: '2 hours'
          },
          status: 'pending'
        },
        {
          id: '3',
          priority: 78,
          type: 'intervention',
          target: 'Sarah Chen',
          targetRole: 'Sales Associate',
          department: 'Sales Floor',
          action: 'Career development discussion - stagnation risk',
          confidence: 75,
          estimatedImpact: {
            sentimentImprovement: 15,
            costSaving: 30000,
            timeRequired: '1 hour'
          },
          status: 'pending'
        },
        {
          id: '4',
          priority: 72,
          type: 'training',
          target: 'New Hires (3)',
          department: 'Customer Service',
          action: 'Enhanced onboarding support needed',
          confidence: 80,
          estimatedImpact: {
            sentimentImprovement: 18,
            costSaving: 25000,
            timeRequired: '1 week'
          },
          status: 'pending'
        },
        {
          id: '5',
          priority: 65,
          type: 'review',
          target: 'All Departments',
          action: 'Implement weekly pulse surveys',
          confidence: 70,
          estimatedImpact: {
            sentimentImprovement: 10,
            costSaving: 15000,
            timeRequired: '2 hours setup'
          },
          status: 'pending'
        }
      ];
      setActionQueue(mockActions);
      
      // Will be replaced with:
      // const response = await api.getActionQueue(5);
      // setActionQueue(response.data);
    } catch (error) {
      console.error('Failed to load action queue:', error);
    }
  };

  const getSentimentColor = (score: number): string => {
    if (score < 40) return 'bg-red-500 hover:bg-red-600';
    if (score < 60) return 'bg-yellow-500 hover:bg-yellow-600';
    if (score < 80) return 'bg-green-500 hover:bg-green-600';
    return 'bg-green-600 hover:bg-green-700';
  };

  const getSentimentEmoji = (score: number): string => {
    if (score < 40) return '😟';
    if (score < 60) return '😐';
    if (score < 80) return '😊';
    return '😄';
  };

  const getPriorityColor = (priority: number): string => {
    if (priority >= 80) return 'bg-red-500';
    if (priority >= 60) return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'meeting': return <MessageSquare className="h-4 w-4" />;
      case 'review': return <Activity className="h-4 w-4" />;
      case 'intervention': return <AlertCircle className="h-4 w-4" />;
      case 'training': return <Users className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const handleActionClick = async (action: ActionItem) => {
    // Mark action as in progress
    setActionQueue(prev => prev.map(a => 
      a.id === action.id ? { ...a, status: 'in_progress' } : a
    ));
    
    // Here you would typically open a modal or navigate to action details
    console.log('Action clicked:', action);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadSentimentData(), loadActionQueue()]);
    setRefreshing(false);
  };

  const handleCellClick = async (dept: string, weekIndex: number, score: number) => {
    setSelectedCell({ dept, week: weekIndex });
    setLoadingInsight(true);
    setCellInsight(null);
    setPendingResult(null);
    setAnimationComplete(false);
    setShowAgentProgress(true);
    
    try {
      const response = await api.analyzeSentimentCell(dept, weekIndex, score);
      
      if (response.success) {
        setPendingResult(response.data);
      }
    } catch (error) {
      console.error('Sentiment cell analysis failed:', error);
      setShowAgentProgress(false);
      setLoadingInsight(false);
    }
  };

  const getAgentIcon = (iconName: string) => {
    switch (iconName) {
      case 'Search': return <Search className="h-5 w-5" />;
      case 'AlertCircle': return <AlertCircle className="h-5 w-5" />;
      case 'Zap': return <Zap className="h-5 w-5" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Heart className="h-8 w-8 text-red-500" />
            <span>Sentiment Analysis Dashboard</span>
          </h1>
          <p className="text-gray-600 mt-1">Real-time employee sentiment monitoring and intervention tracking</p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Activity className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sentiment Heat Map */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Sentiment Heat Map</h2>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-gray-600">Critical</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-gray-600">Warning</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-gray-600">Healthy</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="relative">
              {/* Week labels */}
              <div className="flex justify-end mb-2 pr-2">
                {weeks.map((week) => (
                  <div key={week} className="flex-1 text-center text-sm text-gray-600">
                    {week}
                  </div>
                ))}
              </div>

              {/* Heat map grid */}
              <div className="space-y-2">
                {sentimentData.map((dept) => (
                  <div key={dept.department} className="flex items-center">
                    <div className="w-32 text-sm text-gray-700 pr-3 flex items-center justify-between">
                      <span className="truncate">{dept.department}</span>
                      {dept.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 text-green-500 ml-1" />
                      ) : dept.trend === 'down' ? (
                        <TrendingDown className="h-3 w-3 text-red-500 ml-1" />
                      ) : null}
                    </div>
                    <div className="flex flex-1 space-x-2">
                      {dept.weeklyScores.map((score, weekIndex) => (
                        <motion.div
                          key={weekIndex}
                          whileHover={{ scale: 1.05 }}
                          className={`flex-1 h-12 rounded-lg flex items-center justify-center cursor-pointer transition-all ${getSentimentColor(score)} ${selectedCell?.dept === dept.department && selectedCell?.week === weekIndex ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                          onClick={() => handleCellClick(dept.department, weekIndex, score)}
                        >
                          <span className="text-white font-semibold text-sm">{score}</span>
                          <span className="ml-1 text-lg">{getSentimentEmoji(score)}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Current sentiment summary */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Overall Sentiment</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {Math.round(sentimentData.reduce((sum, d) => sum + d.currentScore, 0) / sentimentData.length)}
                    </span>
                    <span className="text-sm text-gray-500">/100</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Action Priority Queue */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Action Priority Queue</h2>
            <Target className="h-5 w-5 text-blue-500" />
          </div>

          <div className="space-y-3">
            {actionQueue.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleActionClick(item)}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  item.status === 'in_progress' 
                    ? 'bg-blue-50 border-2 border-blue-300' 
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${getPriorityColor(item.priority)}`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {getActionIcon(item.type)}
                        <p className="font-medium text-gray-900">{item.action}</p>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.target} {item.targetRole && `• ${item.targetRole}`} {item.department && `• ${item.department}`}
                      </p>
                      <div className="flex items-center space-x-4 text-xs">
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-3 w-3 text-green-500" />
                          <span className="text-gray-600">+{item.estimatedImpact.sentimentImprovement}% sentiment</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-600">${(item.estimatedImpact.costSaving / 1000).toFixed(0)}K saved</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-600">{item.estimatedImpact.timeRequired}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-lg font-semibold text-blue-600">{item.confidence}%</p>
                    <p className="text-xs text-gray-500">confidence</p>
                  </div>
                </div>
                
                {item.status === 'in_progress' && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-600 font-medium">In Progress</span>
                      <ArrowRight className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {actionQueue.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <p className="font-medium">All clear!</p>
              <p className="text-sm mt-1">No urgent actions required</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal Overlay for AI Analysis */}
      <AnimatePresence>
        {selectedCell && (showAgentProgress || cellInsight) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => {
                if (!showAgentProgress) {
                  setSelectedCell(null);
                  setCellInsight(null);
                }
              }}
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Agent Progress Panel */}
              {showAgentProgress && (
                <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700 bg-gray-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Brain className="h-6 w-6 text-purple-400" />
                    <motion.div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">AI Sentiment Analysis</h3>
                    <p className="text-sm text-gray-400">Analyzing {selectedCell.dept} • {weeks[selectedCell.week]}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-2xl font-mono font-bold text-white">{elapsedTime}s</p>
                    <p className="text-xs text-gray-400">elapsed</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="space-y-3">
                {agentProgress.map((agent, index) => (
                  <motion.div
                    key={agent.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center space-x-4 p-3 rounded-lg transition-all ${
                      agent.status === 'working' ? 'bg-blue-500/20 border border-blue-500/30' :
                      agent.status === 'completed' ? 'bg-green-500/10 border border-green-500/20' :
                      'bg-gray-700/30 border border-gray-600/30'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      agent.status === 'working' ? 'bg-blue-500 text-white' :
                      agent.status === 'completed' ? 'bg-green-500 text-white' :
                      'bg-gray-600 text-gray-400'
                    }`}>
                      {agent.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : agent.status === 'working' ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <RefreshCw className="h-5 w-5" />
                        </motion.div>
                      ) : (
                        getAgentIcon(agent.icon)
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${
                        agent.status === 'working' ? 'text-blue-300' :
                        agent.status === 'completed' ? 'text-green-300' :
                        'text-gray-400'
                      }`}>
                        {agent.displayName}
                      </p>
                      <p className={`text-sm ${
                        agent.status === 'working' ? 'text-blue-400' :
                        agent.status === 'completed' ? 'text-green-400' :
                        'text-gray-500'
                      }`}>
                        {agent.status === 'working' ? agent.workingStatus :
                         agent.status === 'completed' ? agent.doneStatus :
                         'Waiting...'}
                      </p>
                    </div>
                    {agent.status === 'completed' && (
                      <span className="text-green-400 text-sm font-medium">Done</span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-800/50 border-t border-gray-700">
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-4 w-4 text-yellow-400" />
                <motion.p
                  key={currentFactIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-gray-400"
                >
                  {sentimentFacts[currentFactIndex]}
                </motion.p>
              </div>
            </div>
                </div>
              )}

              {/* AI-Powered Cell Insights Panel */}
              {!showAgentProgress && cellInsight && (
                <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                  {cellInsight.aiGenerated && (
                    <div className="px-4 py-2 bg-purple-50 border-b border-purple-200 flex items-center space-x-2">
                      <Brain className="h-4 w-4 text-purple-500" />
                      <span className="text-sm text-purple-700 font-medium">AI-Generated Analysis</span>
                    </div>
                  )}
              {/* Header */}
              <div className={`px-6 py-4 ${
                cellInsight.riskLevel === 'critical' ? 'bg-red-50 border-b border-red-200' :
                cellInsight.riskLevel === 'warning' ? 'bg-yellow-50 border-b border-yellow-200' :
                'bg-green-50 border-b border-green-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                      cellInsight.riskLevel === 'critical' ? 'bg-red-500' :
                      cellInsight.riskLevel === 'warning' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}>
                      {cellInsight.score}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{cellInsight.department}</h3>
                      <p className="text-sm text-gray-600">{weeks[cellInsight.week]} • {cellInsight.affectedEmployees} employees affected</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setSelectedCell(null); setCellInsight(null); }}
                    className="p-2 hover:bg-white/50 rounded-full transition-colors"
                  >
                    <span className="text-gray-500 text-xl">×</span>
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* AI Analysis */}
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    <h4 className="font-semibold text-gray-900">AI Analysis</h4>
                  </div>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{cellInsight.analysis}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Root Causes */}
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      <h4 className="font-semibold text-gray-900">Root Causes Identified</h4>
                    </div>
                    <ul className="space-y-2">
                      {cellInsight.rootCauses.map((cause, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-orange-500 mt-1">•</span>
                          <span className="text-gray-700 text-sm">{cause}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Target className="h-5 w-5 text-blue-500" />
                      <h4 className="font-semibold text-gray-900">Recommended Actions</h4>
                    </div>
                    <div className="space-y-3">
                      {cellInsight.recommendations.map((rec, index) => (
                        <div key={index} className={`p-3 rounded-lg border-l-4 ${
                          rec.urgency === 'high' ? 'bg-red-50 border-red-500' :
                          rec.urgency === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                          'bg-gray-50 border-gray-300'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-medium uppercase ${
                              rec.urgency === 'high' ? 'text-red-600' :
                              rec.urgency === 'medium' ? 'text-yellow-600' :
                              'text-gray-500'
                            }`}>
                              {rec.urgency} priority
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{rec.action}</p>
                          <p className="text-xs text-gray-600 mt-1">Impact: {rec.impact}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SentimentDashboard;