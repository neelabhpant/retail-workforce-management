import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  DollarSign, 
  Shield, 
  CheckCircle, 
  Clock, 
  Zap,
  ArrowRight
} from 'lucide-react';

interface AgentUpdate {
  agent: string;
  status: string;
  progress: number;
  decision: string;
  confidence: number;
  timestamp: string;
}

interface AgentStatus {
  name: string;
  displayName: string;
  icon: React.ComponentType<any>;
  status: 'idle' | 'analyzing' | 'completed';
  progress: number;
  decision: string;
  confidence: number;
  color: string;
  description: string;
}

interface AgentMonitorProps {
  isActive: boolean;
  onAgentUpdate?: (update: AgentUpdate) => void;
}

const AgentMonitor: React.FC<AgentMonitorProps> = ({ isActive, onAgentUpdate }) => {
  const [agents, setAgents] = useState<AgentStatus[]>([
    {
      name: 'demand_forecaster',
      displayName: 'Demand Forecaster',
      icon: TrendingUp,
      status: 'idle',
      progress: 0,
      decision: 'Ready to analyze traffic patterns',
      confidence: 0,
      color: 'blue',
      description: 'Predicts customer demand using historical data'
    },
    {
      name: 'staff_optimizer',
      displayName: 'Staff Optimizer',
      icon: Brain,
      status: 'idle',
      progress: 0,
      decision: 'Waiting for demand forecast',
      confidence: 0,
      color: 'purple',
      description: 'Creates optimal staff assignments'
    },
    {
      name: 'cost_analyst',
      displayName: 'Cost Analyst',
      icon: DollarSign,
      status: 'idle',
      progress: 0,
      decision: 'Ready to analyze costs',
      confidence: 0,
      color: 'green',
      description: 'Calculates costs and identifies savings'
    },
    {
      name: 'compliance_checker',
      displayName: 'Compliance Checker',
      icon: Shield,
      status: 'idle',
      progress: 0,
      decision: 'Ready to verify compliance',
      confidence: 0,
      color: 'orange',
      description: 'Ensures labor law compliance'
    },
    {
      name: 'quality_auditor',
      displayName: 'Quality Auditor',
      icon: CheckCircle,
      status: 'idle',
      progress: 0,
      decision: 'Ready for quality review',
      confidence: 0,
      color: 'indigo',
      description: 'Validates schedule quality'
    }
  ]);

  const [systemStatus, setSystemStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    let ws: WebSocket;
    let pingInterval: NodeJS.Timeout;

    // Connect to WebSocket for agent updates
    const connectWebSocket = () => {
      const wsUrl = 'ws://localhost:8000/ws';
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected successfully');
        
        // Send initial ping to establish connection
        ws.send(JSON.stringify({
          type: 'ping',
          timestamp: new Date().toISOString()
        }));
        
        // Set up keep-alive ping every 30 seconds
        pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'ping',
              timestamp: new Date().toISOString()
            }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'agent_update') {
            const update: AgentUpdate = message;
            handleAgentUpdate(update);
            
            if (onAgentUpdate) {
              onAgentUpdate(update);
            }
          } else if (message.type === 'connection_status') {
            console.log('WebSocket connection status:', message.message);
          } else if (message.type === 'pong') {
            console.log('Received pong from server');
          } else if (message.type === 'error') {
            console.error('WebSocket server error:', message.message);
          }
        } catch (error) {
          console.error('Error parsing agent update:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        if (pingInterval) {
          clearInterval(pingInterval);
        }
      };

      return ws;
    };

    connectWebSocket();

    return () => {
      if (pingInterval) {
        clearInterval(pingInterval);
      }
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [isActive, onAgentUpdate]);

  const handleAgentUpdate = (update: AgentUpdate) => {
    if (update.agent === 'system') {
      if (update.status === 'starting') {
        setSystemStatus('running');
        setOverallProgress(0);
        // Reset all agents
        setAgents(prev => prev.map(agent => ({
          ...agent,
          status: 'idle' as const,
          progress: 0,
          decision: agent.description,
          confidence: 0
        })));
      } else if (update.status === 'completed') {
        setSystemStatus('completed');
        setOverallProgress(100);
      }
      return;
    }

    // Update specific agent
    setAgents(prev => prev.map(agent => {
      if (agent.name === update.agent) {
        return {
          ...agent,
          status: update.status as 'idle' | 'analyzing' | 'completed',
          progress: update.progress,
          decision: update.decision || agent.decision,
          confidence: update.confidence
        };
      }
      return agent;
    }));

    // Update overall progress
    setOverallProgress(update.progress);
  };

  const getAgentStatusColor = (agent: AgentStatus) => {
    if (agent.status === 'completed') return 'text-green-600 border-green-200 bg-green-50';
    if (agent.status === 'analyzing') return `text-${agent.color}-600 border-${agent.color}-200 bg-${agent.color}-50`;
    return 'text-gray-600 border-gray-200 bg-gray-50';
  };

  const getAgentIconColor = (agent: AgentStatus) => {
    if (agent.status === 'completed') return 'text-green-600';
    if (agent.status === 'analyzing') return `text-${agent.color}-600`;
    return 'text-gray-400';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center">
            <Zap className="h-5 w-5 text-blue-500 mr-2" />
            AI Agent Monitor
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            {systemStatus === 'running' 
              ? 'AI agents are working... This typically takes 45-60 seconds'
              : 'Live agent coordination and decision-making'}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
            systemStatus === 'running' ? 'bg-blue-100 text-blue-800' :
            systemStatus === 'completed' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {systemStatus === 'running' ? 'Processing...' :
             systemStatus === 'completed' ? 'Complete' : 'Ready'}
          </div>
          
          {systemStatus === 'running' && (
            <div className="text-sm font-medium text-slate-700">
              {overallProgress}%
            </div>
          )}
        </div>
      </div>

      {/* Overall Progress Bar */}
      {systemStatus === 'running' && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700">
              Overall Progress {overallProgress < 100 && '(Agents use real AI reasoning - please wait)'}
            </span>
            <span className="text-sm text-slate-500">{overallProgress}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {agents.map((agent, index) => {
            const Icon = agent.icon;
            
            return (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`relative border rounded-xl p-4 transition-all duration-300 ${getAgentStatusColor(agent)}`}
              >
                {/* Status Indicator */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${
                      agent.status === 'completed' ? 'bg-green-100' :
                      agent.status === 'analyzing' ? `bg-${agent.color}-100` : 'bg-gray-100'
                    }`}>
                      <Icon className={`h-4 w-4 ${getAgentIconColor(agent)}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{agent.displayName}</h4>
                      <p className="text-xs opacity-75">{agent.description}</p>
                    </div>
                  </div>
                  
                  {/* Status Animation */}
                  {agent.status === 'analyzing' && (
                    <motion.div
                      className={`w-3 h-3 rounded-full bg-${agent.color}-500`}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity
                      }}
                    />
                  )}
                  
                  {agent.status === 'completed' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-3 h-3 rounded-full bg-green-500"
                    />
                  )}
                </div>

                {/* Progress Bar */}
                {agent.status === 'analyzing' && (
                  <div className="mb-3">
                    <div className="w-full bg-white bg-opacity-50 rounded-full h-1.5">
                      <motion.div
                        className={`bg-${agent.color}-500 h-1.5 rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${agent.progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}

                {/* Decision Text */}
                <div className="mb-2">
                  <p className="text-xs font-medium text-slate-700 leading-relaxed">
                    {agent.decision}
                  </p>
                </div>

                {/* Confidence Score */}
                {agent.confidence > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Confidence</span>
                    <span className="font-semibold">
                      {(agent.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                )}

                {/* Processing Animation Overlay */}
                {agent.status === 'analyzing' && (
                  <motion.div
                    className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"
                    animate={{
                      x: ['-100%', '100%']
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Agent Communication Flow */}
      {systemStatus === 'running' && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
            <ArrowRight className="h-4 w-4 mr-1" />
            Agent Communication Flow
          </h4>
          
          <div className="flex items-center justify-between">
            {agents.slice(0, 5).map((agent, index) => (
              <React.Fragment key={agent.name}>
                <div className={`flex flex-col items-center ${
                  agent.status === 'completed' ? 'text-green-600' :
                  agent.status === 'analyzing' ? `text-${agent.color}-600` : 'text-gray-400'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    agent.status === 'completed' ? 'bg-green-100' :
                    agent.status === 'analyzing' ? `bg-${agent.color}-100` : 'bg-gray-100'
                  }`}>
                    <agent.icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs mt-1 font-medium">{agent.displayName.split(' ')[0]}</span>
                </div>
                
                {index < agents.length - 2 && (
                  <motion.div
                    className="flex-1 h-0.5 bg-gradient-to-r from-gray-300 to-gray-300"
                    animate={{
                      background: agent.status === 'completed' 
                        ? 'linear-gradient(to right, #10B981, #10B981)' 
                        : 'linear-gradient(to right, #D1D5DB, #D1D5DB)'
                    }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Completion Summary */}
      {systemStatus === 'completed' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 pt-6 border-t border-slate-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Optimization Complete</h4>
                <p className="text-sm text-slate-600">All agents have successfully completed their tasks</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-xs text-slate-500">Success</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AgentMonitor;