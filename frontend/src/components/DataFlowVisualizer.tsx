import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, Brain, Zap, Play, RotateCcw,
  Cloud, Shield, GitBranch, Cpu, ChevronRight, CheckCircle2,
  AlertCircle, TrendingUp, DollarSign, Users, Clock
} from 'lucide-react';
import { wsManager } from '../services/api';

interface DataFlowEvent {
  type: string;
  event: string;
  data: any;
  businessContext?: string;
  impact?: {
    metric: string;
    value: number;
    unit: string;
  };
}

interface ComponentStatus {
  id: string;
  name: string;
  status: 'idle' | 'active' | 'processing' | 'error';
  icon: React.ComponentType<any>;
  description: string;
  color: string;
}

interface DemoStep {
  id: number;
  title: string;
  description: string;
  component: string;
  status: 'pending' | 'active' | 'completed';
}

interface DataFlowVisualizerProps {
  isTracking?: boolean;
  currentStage?: string;
  trackingData?: any;
}

const DataFlowVisualizer: React.FC<DataFlowVisualizerProps> = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [demoSteps, setDemoSteps] = useState<DemoStep[]>([]);
  const [, setCurrentStepIndex] = useState(-1);
  const [components, setComponents] = useState<ComponentStatus[]>([
    { id: 'nifi', name: 'Apache NiFi', status: 'idle', icon: Cloud, description: 'Data Ingestion', color: 'emerald' },
    { id: 'kafka', name: 'Apache Kafka', status: 'idle', icon: GitBranch, description: 'Event Streaming', color: 'blue' },
    { id: 'warehouse', name: 'Data Warehouse', status: 'idle', icon: Database, description: 'Storage & Query', color: 'orange' },
    { id: 'spark', name: 'Apache Spark', status: 'idle', icon: Cpu, description: 'Processing', color: 'red' },
    { id: 'cml', name: 'CML Workbench', status: 'idle', icon: Brain, description: 'ML Training', color: 'purple' },
    { id: 'agents', name: 'AI Agents', status: 'idle', icon: Zap, description: 'Automation', color: 'yellow' },
  ]);
  
  const [recentEvents, setRecentEvents] = useState<string[]>([]);
  const [businessMetrics, setBusinessMetrics] = useState({
    costSaved: 0,
    efficiency: 0,
    predictions: 0,
    staffOptimized: 0,
  });
  
  const eventLogRef = useRef<HTMLDivElement>(null);
  const demoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scenarios = [
    {
      id: 'black_friday',
      name: 'Black Friday Surge',
      icon: TrendingUp,
      description: 'Handle 200% customer surge in real-time',
      color: 'red',
      steps: [
        { title: 'Surge Detected', description: 'POS systems detect 200% traffic increase in Electronics', component: 'kafka' },
        { title: 'Data Ingested', description: 'NiFi routes surge data to processing pipeline', component: 'nifi' },
        { title: 'ML Analysis', description: 'CML predicts surge will last 2 hours with 96% confidence', component: 'cml' },
        { title: 'Staff Optimized', description: 'AI Agents reallocate 5 staff from Stockroom to Electronics', component: 'agents' },
        { title: 'Results Stored', description: 'Schedule changes saved, $2,400 in overtime avoided', component: 'warehouse' },
      ]
    },
    {
      id: 'staff_shortage',
      name: 'Staff Shortage',
      icon: Users,
      description: 'Auto-respond when 3 employees call out',
      color: 'orange',
      steps: [
        { title: 'Absence Alert', description: '3 employees called out - Customer Service understaffed', component: 'kafka' },
        { title: 'Coverage Analysis', description: 'Spark calculates current 75% coverage vs 95% required', component: 'spark' },
        { title: 'Solution Found', description: 'CML identifies 4 cross-trained staff available nearby', component: 'cml' },
        { title: 'Auto-Reassign', description: 'AI Agents reassign 3 qualified employees automatically', component: 'agents' },
        { title: 'Confirmed', description: 'Coverage restored to 96%, $450 overtime saved', component: 'warehouse' },
      ]
    },
    {
      id: 'predictive',
      name: 'Weekly Forecast',
      icon: Clock,
      description: 'ML-powered schedule for next 7 days',
      color: 'purple',
      steps: [
        { title: 'Data Retrieved', description: 'Warehouse pulls 365 days of historical patterns', component: 'warehouse' },
        { title: 'Processing', description: 'Spark analyzes seasonality, weather, promotions', component: 'spark' },
        { title: 'Forecasting', description: 'CML generates demand prediction with 94% accuracy', component: 'cml' },
        { title: 'Schedule Created', description: 'AI Agents produce optimized schedule for 45 employees', component: 'agents' },
        { title: 'Validated', description: 'All schedules pass labor compliance, $3,200 saved', component: 'warehouse' },
      ]
    }
  ];

  const handleDataFlowEvent = useCallback((event: DataFlowEvent) => {
    if (!isRunning) return;
    
    if (event.businessContext) {
      const timestamp = new Date().toLocaleTimeString();
      setRecentEvents(prev => [...prev.slice(-9), `${timestamp} - ${event.businessContext}`]);
    }

    if (event.impact) {
      setBusinessMetrics(prev => {
        const updated = { ...prev };
        switch (event.impact?.metric) {
          case 'cost_saved':
            updated.costSaved += event.impact.value;
            break;
          case 'efficiency':
            updated.efficiency = Math.max(updated.efficiency, event.impact.value);
            break;
          case 'predictions':
            updated.predictions += event.impact.value;
            break;
          case 'staff_optimized':
            updated.staffOptimized += event.impact.value;
            break;
        }
        return updated;
      });
    }
  }, [isRunning]);

  useEffect(() => {
    wsManager.on('data_flow_event', handleDataFlowEvent);
    return () => {
      wsManager.off('data_flow_event', handleDataFlowEvent);
    };
  }, [handleDataFlowEvent]);

  useEffect(() => {
    if (eventLogRef.current) {
      eventLogRef.current.scrollTop = eventLogRef.current.scrollHeight;
    }
  }, [recentEvents]);

  useEffect(() => {
    return () => {
      if (demoTimeoutRef.current) {
        clearTimeout(demoTimeoutRef.current);
      }
    };
  }, []);

  const runDemoScenario = async (scenarioId: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) return;

    if (demoTimeoutRef.current) {
      clearTimeout(demoTimeoutRef.current);
    }

    setComponents(prev => prev.map(c => ({ ...c, status: 'idle' })));
    setRecentEvents([]);
    setBusinessMetrics({ costSaved: 0, efficiency: 0, predictions: 0, staffOptimized: 0 });
    
    setActiveScenario(scenarioId);
    setIsRunning(true);
    setCurrentStepIndex(0);
    
    const steps: DemoStep[] = scenario.steps.map((step, index) => ({
      id: index,
      ...step,
      status: index === 0 ? 'active' : 'pending'
    }));
    setDemoSteps(steps);

    try {
      const { api } = await import('../services/api');
      await api.runDemoScenario(scenarioId);
    } catch (error) {
      console.error('Failed to run demo scenario:', error);
    }

    for (let i = 0; i < steps.length; i++) {
      await new Promise<void>(resolve => {
        demoTimeoutRef.current = setTimeout(() => {
          setCurrentStepIndex(i);
          setDemoSteps(prev => prev.map((step, idx) => ({
            ...step,
            status: idx < i ? 'completed' : idx === i ? 'active' : 'pending'
          })));
          
          setComponents(prev => prev.map(c => ({
            ...c,
            status: c.id === steps[i].component ? 'active' : 
                   prev.find(p => p.id === c.id)?.status === 'active' && c.id !== steps[i].component ? 'idle' : c.status
          })));

          const timestamp = new Date().toLocaleTimeString();
          setRecentEvents(prev => [...prev.slice(-9), `${timestamp} - ${steps[i].description}`]);

          if (scenarioId === 'black_friday') {
            if (i === 2) setBusinessMetrics(prev => ({ ...prev, predictions: prev.predictions + 1 }));
            if (i === 3) setBusinessMetrics(prev => ({ ...prev, staffOptimized: 5 }));
            if (i === 4) setBusinessMetrics(prev => ({ ...prev, costSaved: 2400, efficiency: 18 }));
          } else if (scenarioId === 'staff_shortage') {
            if (i === 1) setBusinessMetrics(prev => ({ ...prev, predictions: prev.predictions + 1 }));
            if (i === 3) setBusinessMetrics(prev => ({ ...prev, staffOptimized: 3 }));
            if (i === 4) setBusinessMetrics(prev => ({ ...prev, costSaved: 450, efficiency: 22 }));
          } else if (scenarioId === 'predictive') {
            if (i === 2) setBusinessMetrics(prev => ({ ...prev, predictions: prev.predictions + 7 }));
            if (i === 3) setBusinessMetrics(prev => ({ ...prev, staffOptimized: 45 }));
            if (i === 4) setBusinessMetrics(prev => ({ ...prev, costSaved: 3200, efficiency: 15 }));
          }

          resolve();
        }, 2500);
      });
    }

    setTimeout(() => {
      setDemoSteps(prev => prev.map(step => ({ ...step, status: 'completed' })));
      setComponents(prev => prev.map(c => ({ ...c, status: 'idle' })));
      setIsRunning(false);
    }, 1000);
  };

  const resetDemo = () => {
    if (demoTimeoutRef.current) {
      clearTimeout(demoTimeoutRef.current);
    }
    setActiveScenario(null);
    setDemoSteps([]);
    setCurrentStepIndex(-1);
    setIsRunning(false);
    setRecentEvents([]);
    setBusinessMetrics({ costSaved: 0, efficiency: 0, predictions: 0, staffOptimized: 0 });
    setComponents(prev => prev.map(c => ({ ...c, status: 'idle' })));
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
      emerald: { bg: 'bg-emerald-500/20', border: 'border-emerald-500', text: 'text-emerald-400', glow: 'shadow-emerald-500/50' },
      blue: { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-400', glow: 'shadow-blue-500/50' },
      orange: { bg: 'bg-orange-500/20', border: 'border-orange-500', text: 'text-orange-400', glow: 'shadow-orange-500/50' },
      red: { bg: 'bg-red-500/20', border: 'border-red-500', text: 'text-red-400', glow: 'shadow-red-500/50' },
      purple: { bg: 'bg-purple-500/20', border: 'border-purple-500', text: 'text-purple-400', glow: 'shadow-purple-500/50' },
      yellow: { bg: 'bg-yellow-500/20', border: 'border-yellow-500', text: 'text-yellow-400', glow: 'shadow-yellow-500/50' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Cloudera Data Platform</h2>
            <p className="text-gray-500 mt-1">Real-time retail workforce management powered by AI</p>
          </div>
          <div className="flex items-center gap-3">
            {isRunning && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Running
              </div>
            )}
            <button
              onClick={resetDemo}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: Demo Scenarios */}
        <div className="col-span-3 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Scenarios</h3>
            <div className="space-y-3">
              {scenarios.map((scenario) => {
                const Icon = scenario.icon;
                const isActive = activeScenario === scenario.id;
                return (
                  <button
                    key={scenario.id}
                    onClick={() => !isRunning && runDemoScenario(scenario.id)}
                    disabled={isRunning}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isActive 
                        ? `border-${scenario.color}-500 bg-${scenario.color}-50` 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    } ${isRunning && !isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isActive ? `bg-${scenario.color}-100` : 'bg-gray-100'}`}>
                        <Icon className={`w-5 h-5 ${isActive ? `text-${scenario.color}-600` : 'text-gray-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{scenario.name}</div>
                        <div className="text-xs text-gray-500 truncate">{scenario.description}</div>
                      </div>
                      {!isRunning && (
                        <Play className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Business Impact */}
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl shadow-sm p-5 text-white">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Business Impact
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-emerald-100 text-sm">Cost Saved</span>
                <span className="font-bold text-lg">${businessMetrics.costSaved.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-100 text-sm">Efficiency Gain</span>
                <span className="font-bold text-lg">{businessMetrics.efficiency}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-100 text-sm">ML Predictions</span>
                <span className="font-bold text-lg">{businessMetrics.predictions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-100 text-sm">Staff Optimized</span>
                <span className="font-bold text-lg">{businessMetrics.staffOptimized}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Architecture Visualization */}
        <div className="col-span-6">
          <div className="bg-slate-900 rounded-xl shadow-lg p-6 h-full">
            {/* Governance Banner */}
            <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                <span className="text-blue-300 font-medium">Apache Ranger - Unified Security & Governance</span>
              </div>
            </div>

            {/* Component Grid */}
            <div className="grid grid-cols-3 gap-4">
              {/* Column Labels */}
              <div className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Ingestion</div>
              <div className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Processing</div>
              <div className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Intelligence</div>
              
              {/* Row 1 */}
              {['nifi', 'warehouse', 'cml'].map((id) => {
                const comp = components.find(c => c.id === id)!;
                const Icon = comp.icon;
                const colors = getColorClasses(comp.color);
                return (
                  <motion.div
                    key={comp.id}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      comp.status === 'active' 
                        ? `${colors.border} ${colors.bg} shadow-lg ${colors.glow}` 
                        : 'border-slate-700 bg-slate-800/50'
                    }`}
                    animate={comp.status === 'active' ? { scale: [1, 1.02, 1] } : {}}
                    transition={{ duration: 1, repeat: comp.status === 'active' ? Infinity : 0 }}
                  >
                    {comp.status === 'active' && (
                      <motion.div 
                        className={`absolute -top-1 -right-1 w-3 h-3 ${colors.border.replace('border', 'bg')} rounded-full`}
                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    )}
                    <div className="flex flex-col items-center text-center">
                      <div className={`p-3 rounded-lg mb-2 ${comp.status === 'active' ? colors.bg : 'bg-slate-700'}`}>
                        <Icon className={`w-6 h-6 ${comp.status === 'active' ? colors.text : 'text-slate-400'}`} />
                      </div>
                      <span className="text-white font-medium text-sm">{comp.name}</span>
                      <span className="text-slate-500 text-xs mt-1">{comp.description}</span>
                    </div>
                  </motion.div>
                );
              })}

              {/* Row 2 */}
              {['kafka', 'spark', 'agents'].map((id) => {
                const comp = components.find(c => c.id === id)!;
                const Icon = comp.icon;
                const colors = getColorClasses(comp.color);
                return (
                  <motion.div
                    key={comp.id}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      comp.status === 'active' 
                        ? `${colors.border} ${colors.bg} shadow-lg ${colors.glow}` 
                        : 'border-slate-700 bg-slate-800/50'
                    }`}
                    animate={comp.status === 'active' ? { scale: [1, 1.02, 1] } : {}}
                    transition={{ duration: 1, repeat: comp.status === 'active' ? Infinity : 0 }}
                  >
                    {comp.status === 'active' && (
                      <motion.div 
                        className={`absolute -top-1 -right-1 w-3 h-3 ${colors.border.replace('border', 'bg')} rounded-full`}
                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    )}
                    <div className="flex flex-col items-center text-center">
                      <div className={`p-3 rounded-lg mb-2 ${comp.status === 'active' ? colors.bg : 'bg-slate-700'}`}>
                        <Icon className={`w-6 h-6 ${comp.status === 'active' ? colors.text : 'text-slate-400'}`} />
                      </div>
                      <span className="text-white font-medium text-sm">{comp.name}</span>
                      <span className="text-slate-500 text-xs mt-1">{comp.description}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Data Flow Arrows */}
            <div className="flex items-center justify-center gap-2 mt-6 text-slate-500">
              <span className="text-xs">Data flows:</span>
              <div className="flex items-center gap-1">
                <div className="w-8 h-0.5 bg-gradient-to-r from-emerald-500 to-orange-500"></div>
                <ChevronRight className="w-3 h-3" />
                <div className="w-8 h-0.5 bg-gradient-to-r from-orange-500 to-purple-500"></div>
                <ChevronRight className="w-3 h-3" />
                <div className="w-8 h-0.5 bg-gradient-to-r from-purple-500 to-yellow-500"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Demo Progress & Events */}
        <div className="col-span-3 space-y-4">
          {/* Demo Progress */}
          {demoSteps.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Progress</h3>
              <div className="space-y-3">
                {demoSteps.map((step, index) => (
                  <div key={step.id} className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      step.status === 'completed' ? 'bg-green-100' :
                      step.status === 'active' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {step.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : step.status === 'active' ? (
                        <motion.div 
                          className="w-3 h-3 bg-blue-500 rounded-full"
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      ) : (
                        <span className="text-xs text-gray-400">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${
                        step.status === 'completed' ? 'text-green-700' :
                        step.status === 'active' ? 'text-blue-700' : 'text-gray-400'
                      }`}>
                        {step.title}
                      </div>
                      <div className={`text-xs ${
                        step.status === 'active' ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {step.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Event Log */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex-1">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live Events
            </h3>
            <div
              ref={eventLogRef}
              className="h-64 overflow-y-auto space-y-2 bg-slate-900 rounded-lg p-3"
            >
              {recentEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-sm">Select a scenario</span>
                  <span className="text-xs">Events will appear here</span>
                </div>
              ) : (
                <AnimatePresence>
                  {recentEvents.map((event, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2 p-2 hover:bg-slate-800 rounded text-xs"
                    >
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span className="text-slate-300 font-mono leading-relaxed">{event}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataFlowVisualizer;
