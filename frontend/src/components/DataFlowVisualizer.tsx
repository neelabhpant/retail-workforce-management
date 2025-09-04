import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, Brain, Activity, Zap, ArrowRight, Play, Pause, RotateCcw,
  Cloud, Server, Shield, BarChart3, GitBranch, Cpu
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
  position: { x: number; y: number };
  description: string;
  type: 'ingestion' | 'storage' | 'processing' | 'ml' | 'analytics' | 'streaming' | 'security';
  metrics?: {
    throughput?: string;
    latency?: string;
    accuracy?: string;
  };
}

interface DataParticle {
  id: string;
  path: string;
  startComponent: string;
  endComponent: string;
  data: any;
  color: string;
}

const DataFlowVisualizer: React.FC = () => {
  const [isRunning, setIsRunning] = useState(true);
  const [components, setComponents] = useState<ComponentStatus[]>([
    // Governance (foundation layer)
    {
      id: 'ranger',
      name: 'Apache Ranger',
      status: 'idle',
      icon: Shield,
      position: { x: 315, y: 130 },
      description: 'Security & governance',
      type: 'security',
      metrics: { throughput: '100K/s', latency: '0.01s' }
    },
    // Data Sources (left column - on governance foundation)
    {
      id: 'nifi',
      name: 'Apache NiFi',
      status: 'idle',
      icon: Cloud,
      position: { x: 125, y: 265 },
      description: 'Data ingestion & routing',
      type: 'ingestion',
      metrics: { throughput: '15K/s', latency: '0.1s' }
    },
    {
      id: 'kafka',
      name: 'Apache Kafka',
      status: 'idle',
      icon: GitBranch,
      position: { x: 125, y: 365 },
      description: 'Event streaming',
      type: 'streaming',
      metrics: { throughput: '50K/s', latency: '0.05s' }
    },
    // Processing (center column - on governance foundation)
    {
      id: 'data_warehouse',
      name: 'Data Warehouse',
      status: 'idle',
      icon: Database,
      position: { x: 315, y: 265 },
      description: 'Structured storage',
      type: 'storage',
      metrics: { throughput: '10K/s', latency: '0.2s' }
    },
    {
      id: 'spark',
      name: 'Apache Spark',
      status: 'idle',
      icon: Cpu,
      position: { x: 315, y: 365 },
      description: 'Big data processing',
      type: 'processing',
      metrics: { throughput: '100K/s', latency: '2s' }
    },
    // Insights (right column - on governance foundation)
    {
      id: 'ml_platform',
      name: 'CML Workbench',
      status: 'idle',
      icon: Brain,
      position: { x: 505, y: 285 },
      description: 'ML model training',
      type: 'ml',
      metrics: { accuracy: '94.2%', latency: '0.3s' }
    },
    {
      id: 'agents',
      name: 'AI Agents',
      status: 'idle',
      icon: Zap,
      position: { x: 505, y: 365 },
      description: 'Business automation',
      type: 'ml',
      metrics: { accuracy: '92%', latency: '1s' }
    }
  ]);

  const [particles, setParticles] = useState<DataParticle[]>([]);
  const [recentEvents, setRecentEvents] = useState<string[]>([
    '10:00:00 AM - 🔄 System initialized: CDP platform ready',
    '10:00:01 AM - 📊 Morning shift 85% staffed - ML predicts sufficient coverage',
    '10:00:02 AM - ✅ Schedule optimized: $1,200 saved, 12% efficiency gain'
  ]);
  const [businessMetrics, setBusinessMetrics] = useState({
    costSaved: 0,
    efficiencyGain: 0,
    predictionsToday: 0,
    staffOptimized: 0,
    issuesPrevented: 0,
    customerSatisfaction: 0
  });
  const particleIdRef = useRef(0);
  const eventLogRef = useRef<HTMLDivElement>(null);

  // Handler for data flow events
  const handleDataFlowEvent = useCallback((event: DataFlowEvent) => {
    console.log('[DataFlow] Received event:', event.event, event.businessContext);
    if (!isRunning) return;
    
    // Filter out generic CDP platform events without business context
    const relevantEvents = [
      'customer_surge', 'demand_forecast', 'schedule_optimization',
      'retention_alert', 'compliance_check', 'inventory_impact',
      'ml_training', 'employee_clock_in', 'staff_shortage'
    ];
    
    // Only process events that have business context or are in our relevant list
    if (!event.businessContext && !relevantEvents.includes(event.event || '')) {
      console.log('[DataFlow] Skipping event without business context');
      return; // Skip generic platform events
    }

    // Update component status
    updateComponentStatus(event.event, 'active');
    
    // Add particle animation
    createDataParticle(event);
    
    // Add to event log only if meaningful
    if (event.businessContext || event.event) {
      console.log('[DataFlow] Adding to event log:', event.businessContext);
      addToEventLog(event);
    }

    // Update business metrics
    if (event.impact) {
      setBusinessMetrics(prev => {
        const updated = { ...prev };
        switch (event.impact?.metric) {
          case 'cost_saved':
            updated.costSaved += event.impact.value;
            break;
          case 'predictions':
            updated.predictionsToday += event.impact.value;
            break;
          case 'staff_optimized':
            updated.staffOptimized += event.impact.value;
            break;
          case 'issues_prevented':
            updated.issuesPrevented += event.impact.value;
            break;
          case 'efficiency':
            updated.customerSatisfaction = Math.min(99, updated.customerSatisfaction + event.impact.value);
            break;
        }
        return updated;
      });
    }

    // Reset component status after animation
    setTimeout(() => {
      updateComponentStatus(event.event, 'idle');
    }, 2000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  // Listen for real-time events from WebSocket
  useEffect(() => {
    wsManager.on('data_flow_event', handleDataFlowEvent);
    return () => {
      wsManager.off('data_flow_event', handleDataFlowEvent);
    };
  }, [handleDataFlowEvent]);

  // Automatic simulation of data flow events
  useEffect(() => {
    if (!isRunning) return;
    
    const simulatedEvents: DataFlowEvent[] = [
      {
        type: 'data_flow_event',
        event: 'customer_surge',
        data: { 
          surge_percent: Math.floor(Math.random() * 100) + 50, 
          department: ['Electronics', 'Checkout', 'Customer Service'][Math.floor(Math.random() * 3)],
          current_customers: Math.floor(Math.random() * 500) + 300
        },
        businessContext: `🚨 Traffic surge detected: +${Math.floor(Math.random() * 100) + 50}% customers in ${['Electronics', 'Checkout', 'Customer Service'][Math.floor(Math.random() * 3)]}`,
        impact: { metric: 'predictions', value: 1, unit: 'count' }
      },
      {
        type: 'data_flow_event',
        event: 'demand_forecast',
        data: { 
          accuracy: Math.floor(Math.random() * 10) + 90,
          period: '2 hours',
          predicted_peak: Math.floor(Math.random() * 1000) + 500
        },
        businessContext: `📈 ML forecast: ${Math.floor(Math.random() * 10) + 90}% accuracy for next 2 hours`,
        impact: { metric: 'efficiency', value: 15, unit: 'percent' }
      },
      {
        type: 'data_flow_event',
        event: 'schedule_optimization',
        data: { 
          staff_moved: Math.floor(Math.random() * 5) + 1,
          cost_saved: Math.floor(Math.random() * 2000) + 500,
          efficiency_gain: Math.floor(Math.random() * 20) + 10
        },
        businessContext: `✅ Schedule optimized: $${Math.floor(Math.random() * 2000) + 500} saved today`,
        impact: { metric: 'cost_saved', value: Math.floor(Math.random() * 2000) + 500, unit: 'dollars' }
      },
      {
        type: 'data_flow_event',
        event: 'retention_alert',
        data: { 
          risk_score: Math.floor(Math.random() * 30) + 70,
          employee_name: `Employee ${Math.floor(Math.random() * 100)}`
        },
        businessContext: `⚠️ Retention risk: Employee flagged with ${Math.floor(Math.random() * 30) + 70}% turnover risk`,
        impact: { metric: 'staff_optimized', value: 1, unit: 'count' }
      },
      {
        type: 'data_flow_event',
        event: 'compliance_check',
        data: { violations: 0 },
        businessContext: '🛡️ Compliance validated: All schedules meet labor requirements',
        impact: { metric: 'issues_prevented', value: 1, unit: 'count' }
      }
    ];
    
    // Start simulation immediately and then every 2-3 seconds
    const runSimulation = () => {
      const randomEvent = simulatedEvents[Math.floor(Math.random() * simulatedEvents.length)];
      console.log('[DataFlow Simulation] Generating event:', randomEvent.event);
      handleDataFlowEvent(randomEvent);
    };
    
    // Run first event immediately
    setTimeout(() => runSimulation(), 500); // Small delay for initial load
    
    // Then run events periodically with consistent timing
    const interval = setInterval(() => {
      runSimulation();
    }, 2500); // Every 2.5 seconds for consistent flow
    
    return () => clearInterval(interval);
  }, [isRunning, handleDataFlowEvent]);

  // Auto-scroll event log
  useEffect(() => {
    if (eventLogRef.current) {
      eventLogRef.current.scrollTop = eventLogRef.current.scrollHeight;
    }
  }, [recentEvents]);

  const updateComponentStatus = (eventType: string | undefined, status: ComponentStatus['status']) => {
    if (!eventType) return;
    
    setComponents(prev => prev.map(comp => {
      if (eventType.includes('employee') && comp.id === 'data_warehouse') {
        return { ...comp, status };
      } else if (eventType.includes('performance') && comp.id === 'ml_platform') {
        return { ...comp, status };
      } else if (eventType.includes('customer') && comp.id === 'data_flow') {
        return { ...comp, status };
      } else if (eventType.includes('schedule') && comp.id === 'agents') {
        return { ...comp, status };
      }
      return comp;
    }));
  };

  const createDataParticle = (event: DataFlowEvent) => {
    if (!event.event) return;
    
    const particleId = `particle_${particleIdRef.current++}`;
    
    let startComponent = 'nifi';
    let endComponent = 'data_warehouse';
    let color = 'bg-blue-500';

    // Determine particle path based on event type - showing realistic CDP data flow
    switch (event.event) {
      case 'employee_clock_in':
        // HR System → NiFi → Kafka → Data Warehouse
        startComponent = 'nifi';
        endComponent = 'kafka';
        color = 'bg-green-500';
        // Create follow-up particle
        setTimeout(() => createFollowUpParticle('kafka', 'data_warehouse', 'bg-green-500'), 1000);
        break;
        
      case 'customer_surge':
        // POS → Kafka → Spark → ML Platform → Agents
        startComponent = 'kafka';
        endComponent = 'spark';
        color = 'bg-red-500';
        setTimeout(() => createFollowUpParticle('spark', 'ml_platform', 'bg-red-500'), 1500);
        setTimeout(() => createFollowUpParticle('ml_platform', 'agents', 'bg-red-500'), 3000);
        break;
        
      case 'retention_alert':
        // Data Warehouse → ML Platform → Agents
        startComponent = 'data_warehouse';
        endComponent = 'ml_platform';
        color = 'bg-orange-500';
        setTimeout(() => createFollowUpParticle('ml_platform', 'agents', 'bg-orange-500'), 2000);
        break;
        
      case 'demand_forecast':
        // Spark → ML Platform → Impala
        startComponent = 'spark';
        endComponent = 'ml_platform';
        color = 'bg-purple-500';
        setTimeout(() => createFollowUpParticle('ml_platform', 'agents', 'bg-purple-500'), 2000);
        break;
        
      case 'schedule_optimization':
        // ML Platform → Agents → Impala
        startComponent = 'ml_platform';
        endComponent = 'agents';
        color = 'bg-indigo-500';
        setTimeout(() => createFollowUpParticle('ml_platform', 'agents', 'bg-indigo-500'), 2000);
        break;
        
      case 'compliance_check':
        // Data Warehouse → Ranger → Impala
        startComponent = 'data_warehouse';
        endComponent = 'ranger';
        color = 'bg-yellow-500';
        setTimeout(() => createFollowUpParticle('ranger', 'agents', 'bg-yellow-500'), 1500);
        break;
        
      default:
        startComponent = 'kafka';
        endComponent = 'spark';
        color = 'bg-blue-500';
    }

    const particle: DataParticle = {
      id: particleId,
      path: `${startComponent}-${endComponent}`,
      startComponent,
      endComponent,
      data: event.data,
      color
    };

    setParticles(prev => [...prev, particle]);

    // Remove particle after animation completes
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== particleId));
    }, 4500);
  };

  const createFollowUpParticle = (startId: string, endId: string, colorClass: string) => {
    const particleId = `particle_${particleIdRef.current++}`;
    const particle: DataParticle = {
      id: particleId,
      path: `${startId}-${endId}`,
      startComponent: startId,
      endComponent: endId,
      data: {},
      color: colorClass
    };
    
    setParticles(prev => [...prev, particle]);
    
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== particleId));
    }, 4500);
  };

  const addToEventLog = (event: DataFlowEvent) => {
    const timestamp = new Date().toLocaleTimeString();
    const eventDescription = formatEventDescription(event);
    
    // Don't add empty event descriptions
    if (!eventDescription || eventDescription === '') {
      return;
    }
    
    setRecentEvents(prev => {
      const newEvents = [...prev, `${timestamp} - ${eventDescription}`];
      return newEvents.slice(-20); // Keep only last 20 events
    });
    
    // Update business metrics based on event
    if (event.impact) {
      setBusinessMetrics(prev => {
        const updated = { ...prev };
        switch (event.impact?.metric) {
          case 'cost_saved':
            updated.costSaved += event.impact?.value || 0;
            break;
          case 'efficiency':
            updated.efficiencyGain = Math.max(updated.efficiencyGain, event.impact?.value || 0);
            break;
          case 'predictions':
            updated.predictionsToday += 1;
            break;
          case 'staff_optimized':
            updated.staffOptimized += event.impact?.value || 0;
            break;
          case 'issues_prevented':
            updated.issuesPrevented += 1;
            break;
          case 'satisfaction':
            updated.customerSatisfaction = event.impact?.value || 0;
            break;
        }
        return updated;
      });
    }
    
    // Simulate metric updates for demo
    setBusinessMetrics(prev => ({
      ...prev,
      predictionsToday: prev.predictionsToday + 1
    }));
  };

  const formatEventDescription = (event: DataFlowEvent): string => {
    if (!event.event) return 'Unknown event processed';
    
    // If event has business context, prioritize that
    if (event.businessContext) {
      return event.businessContext;
    }
    
    // Enhanced event descriptions with business impact
    switch (event.event) {
      case 'employee_clock_in':
        const shiftCoverage = event.data?.shift_coverage || 85;
        const expectedCustomers = event.data?.expected_customers || 450;
        return `📊 Morning shift ${shiftCoverage}% staffed (${event.data?.current}/${event.data?.required || 20}) - ML predicts sufficient for ${expectedCustomers} customers`;
      
      case 'customer_surge':
        const surgePercent = event.data?.surge_percent || 40;
        return `🚨 Customer traffic surge detected: +${surgePercent}% in ${event.data?.department || 'Electronics'} - Reallocating staff from overstaffed areas`;
      
      case 'retention_alert':
        const riskScore = event.data?.risk_score || 78;
        const employee = event.data?.employee_name || 'Employee';
        return `⚠️ Retention risk: ${employee} flagged with ${riskScore}% turnover probability - Manager intervention scheduled`;
      
      case 'schedule_optimization':
        const costSaved = event.data?.cost_saved || 1200;
        const efficiency = event.data?.efficiency_gain || 12;
        return `✅ Schedule optimized: $${costSaved} saved, ${efficiency}% efficiency gain - No overtime needed`;
      
      case 'demand_forecast':
        const accuracy = event.data?.accuracy || 94;
        const period = event.data?.period || '2 hours';
        return `📈 Demand forecast: ${accuracy}% accurate prediction for next ${period} - Adjusting staffing levels`;
      
      case 'inventory_impact':
        const deliveryTime = event.data?.delivery_time || '3 hours';
        const staffAdjusted = event.data?.staff_adjusted || 3;
        return `📦 Inventory delivery in ${deliveryTime} - Adjusted ${staffAdjusted} staff breaks to handle receiving`;
      
      case 'compliance_check':
        const violations = event.data?.violations || 0;
        const status = violations > 0 ? `Found ${violations} issues` : 'All clear';
        return `🛡️ Compliance check: ${status} - Labor laws validated across all schedules`;
      
      case 'ml_training':
        const modelType = event.data?.model || 'retention';
        const improvement = event.data?.improvement || 5;
        return `🤖 ML model updated: ${modelType} model retrained with ${improvement}% accuracy improvement`;
      
      default:
        // Only show generic message for events we recognize
        if (event.event?.includes('demo') || event.event?.includes('scenario')) {
          return '🔄 Demo scenario in progress...';
        }
        // Don't show anything for unrecognized events
        return '';
    }
  };

  const getComponentStatusColor = (status: ComponentStatus['status']): string => {
    switch (status) {
      case 'active':
        return 'border-green-400 bg-green-50';
      case 'processing':
        return 'border-yellow-400 bg-yellow-50';
      case 'error':
        return 'border-red-400 bg-red-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  const toggleVisualization = () => {
    setIsRunning(!isRunning);
  };

  const resetVisualization = () => {
    setParticles([]);
    setRecentEvents([]);
    setComponents(prev => prev.map(comp => ({ ...comp, status: 'idle' })));
  };

  const runDemoScenario = async (scenario: string) => {
    try {
      const { api } = await import('../services/api');
      await api.runDemoScenario(scenario);
    } catch (error) {
      console.error('Failed to run demo scenario:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">CDP Data Flow</h2>
          <p className="text-gray-600">Real-time data processing visualization</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleVisualization}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
              isRunning
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isRunning ? 'Pause' : 'Resume'}</span>
          </button>
          
          <button
            onClick={resetVisualization}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Flow Visualization */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 rounded-xl p-6 h-[450px] relative overflow-hidden border border-slate-700 shadow-2xl">
            {/* Professional header overlay */}
            <div className="absolute top-4 left-6 z-30">
              <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1 border border-white/10">
                <div className={`w-2 h-2 ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-500'} rounded-full`}></div>
                <span className="text-xs font-semibold text-white/80">
                  {isRunning ? 'Live Data Flow - Generating Events' : 'Data Flow Monitoring - Paused'}
                </span>
              </div>
            </div>
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 700 450"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Professional dark theme definitions */}
              <defs>
                <radialGradient id="darkGlow" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stopColor="#1e293b" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0"/>
                </radialGradient>
                
                {/* Container gradients */}
                <linearGradient id="governanceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15"/>
                  <stop offset="50%" stopColor="#2563eb" stopOpacity="0.12"/>
                  <stop offset="100%" stopColor="#1e40af" stopOpacity="0.08"/>
                </linearGradient>
                
                <linearGradient id="sourcesGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.08"/>
                  <stop offset="100%" stopColor="#16a34a" stopOpacity="0.03"/>
                </linearGradient>
                
                <linearGradient id="processingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fb923c" stopOpacity="0.08"/>
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.03"/>
                </linearGradient>
                
                <linearGradient id="insightsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.08"/>
                  <stop offset="100%" stopColor="#9333ea" stopOpacity="0.03"/>
                </linearGradient>
                
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                
                <filter id="containerShadow">
                  <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#000000" flood-opacity="0.15"/>
                </filter>
                
                <filter id="foundationGlow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#3b82f6" flood-opacity="0.3"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                
                <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                  <path d="M 0 0 L 8 4 L 0 8 z" fill="#64748b" opacity="0.8"/>
                </marker>
              </defs>
              
              {/* Dark background */}
              <rect width="100%" height="100%" fill="#0f172a"/>
              <rect width="100%" height="100%" fill="url(#darkGlow)"/>
              
              {/* Professional grouping containers with governance foundation */}
              <g className="containers">
                {/* Governance Foundation Layer - spans all three pillars */}
                <rect x="65" y="85" width="500" height="105" rx="8" 
                      fill="url(#governanceGradient)" stroke="#3b82f6" strokeWidth="3" 
                      opacity="0.95" filter="url(#foundationGlow)"/>
                <text x="315" y="78" className="text-[14px] font-bold tracking-wider uppercase" 
                      fill="#60a5fa" textAnchor="middle">Governance / SDX</text>
                <text x="315" y="172" className="text-[10px] font-medium" 
                      fill="#94a3b8" textAnchor="middle">Unified Security &amp; Governance Layer</text>
                
                {/* Three Pillars resting on Governance */}
                {/* Data Sources Container */}
                <rect x="70" y="210" width="110" height="200" rx="10" 
                      fill="url(#sourcesGradient)" stroke="#22c55e" strokeWidth="2" 
                      strokeDasharray="6 3" opacity="0.85" filter="url(#containerShadow)"/>
                <text x="125" y="203" className="text-[13px] font-bold tracking-wider uppercase" 
                      fill="#4ade80" textAnchor="middle">Sources</text>
                
                {/* Processing Container */}
                <rect x="260" y="210" width="110" height="200" rx="10" 
                      fill="url(#processingGradient)" stroke="#fb923c" strokeWidth="2" 
                      strokeDasharray="6 3" opacity="0.85" filter="url(#containerShadow)"/>
                <text x="315" y="203" className="text-[13px] font-bold tracking-wider uppercase" 
                      fill="#fdba74" textAnchor="middle">Processing</text>
                
                {/* Insights Container */}
                <rect x="450" y="210" width="110" height="200" rx="10" 
                      fill="url(#insightsGradient)" stroke="#a855f7" strokeWidth="2" 
                      strokeDasharray="6 3" opacity="0.85" filter="url(#containerShadow)"/>
                <text x="505" y="203" className="text-[13px] font-bold tracking-wider uppercase" 
                      fill="#c084fc" textAnchor="middle">Insights</text>
              </g>
              
              {/* Connection lines showing data flow and governance */}
              <g className="connections">
                {/* Governance support/policy lines to each pillar */}
                <path d="M 125 190 L 125 210" stroke="#3b82f6" strokeWidth="2.5" opacity="0.6"/>
                <path d="M 315 190 L 315 210" stroke="#3b82f6" strokeWidth="2.5" opacity="0.6"/>
                <path d="M 505 190 L 505 210" stroke="#3b82f6" strokeWidth="2.5" opacity="0.6"/>
                
                {/* Sources to Processing data flow */}
                <path d="M 180 265 L 260 265" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow)" opacity="0.7"/>
                <path d="M 180 365 L 260 365" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow)" opacity="0.7"/>
                
                {/* Cross connections */}
                <path d="M 180 265 L 260 365" stroke="#475569" strokeWidth="1.5" markerEnd="url(#arrow)" opacity="0.5"/>
                <path d="M 180 365 L 260 265" stroke="#475569" strokeWidth="1.5" markerEnd="url(#arrow)" opacity="0.5"/>
                
                {/* Processing to Insights data flow */}
                <path d="M 370 265 L 450 285" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow)" opacity="0.7"/>
                <path d="M 370 365 L 450 365" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow)" opacity="0.7"/>
                
                {/* Insights internal connection - CML to AI Agents */}
                <path d="M 505 305 L 505 345" stroke="#475569" strokeWidth="1.5" markerEnd="url(#arrow)" opacity="0.5"/>
              </g>
              
              {/* Enhanced animated data particles */}
              <AnimatePresence>
                {particles.map((particle) => {
                  const startComp = components.find(c => c.id === particle.startComponent);
                  const endComp = components.find(c => c.id === particle.endComponent);
                  
                  if (!startComp || !endComp) return null;
                  
                  const particleColor = '#22d3ee'; // Cyan for visibility on dark background
                  
                  return (
                    <g key={particle.id}>
                      {/* Particle trail effect */}
                      <motion.circle
                        r="20"
                        fill={particleColor}
                        opacity="0.1"
                        initial={{ 
                          cx: startComp.position.x,
                          cy: startComp.position.y,
                        }}
                        animate={{ 
                          cx: endComp.position.x,
                          cy: endComp.position.y,
                        }}
                        transition={{ 
                          duration: 4,
                          ease: "easeInOut"
                        }}
                      />
                      
                      {/* Main particle with enhanced visibility */}
                      <motion.circle
                        r="10"
                        fill={particleColor}
                        stroke="white"
                        strokeWidth="3"
                        filter="url(#particleGlow)"
                        initial={{ 
                          cx: startComp.position.x,
                          cy: startComp.position.y,
                          opacity: 0,
                          scale: 0.2
                        }}
                        animate={{ 
                          cx: endComp.position.x,
                          cy: endComp.position.y,
                          opacity: [0, 0.8, 1, 1, 0.8, 0],
                          scale: [0.2, 1, 1.3, 1, 1, 0.5]
                        }}
                        transition={{ 
                          duration: 4,
                          ease: "easeInOut",
                          times: [0, 0.2, 0.4, 0.6, 0.8, 1]
                        }}
                      />
                      
                      {/* Particle core */}
                      <motion.circle
                        r="4"
                        fill="white"
                        initial={{ 
                          cx: startComp.position.x,
                          cy: startComp.position.y,
                          opacity: 0
                        }}
                        animate={{ 
                          cx: endComp.position.x,
                          cy: endComp.position.y,
                          opacity: [0, 1, 1, 1, 0]
                        }}
                        transition={{ 
                          duration: 4,
                          ease: "easeInOut"
                        }}
                      />
                    </g>
                  );
                })}
              </AnimatePresence>
              
              {/* Enterprise-grade component cards - inside SVG for proper positioning */}
              {components.map((component) => {
                const Icon = component.icon;
                // Calculate foreignObject position (top-left corner)
                const x = component.position.x - 55; // Half of 110px width
                const y = component.position.y - 42.5; // Half of 85px height
                
                return (
                  <foreignObject
                    key={component.id}
                    x={x}
                    y={y}
                    width="110"
                    height="85"
                    style={{ overflow: 'visible' }}
                  >
                    <motion.div
                      className={`w-full h-full transition-all duration-500 ${
                        component.status === 'active' ? 'drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]' : ''
                      }`}
                      animate={component.status === 'active' ? {
                        scale: [1, 1.05, 1],
                      } : {}}
                      transition={{ duration: 2, repeat: component.status === 'active' ? Infinity : 0 }}
                    >
                      <div className={`relative rounded-md p-4 w-[110px] h-[85px] text-center transition-all duration-300 ${
                        component.status === 'active' 
                          ? 'bg-slate-800/80 border border-green-500/50 shadow-lg shadow-green-500/20' 
                          : 'bg-slate-800/50 border border-slate-700 hover:bg-slate-800/70 hover:border-slate-600'
                      }`}>
                        
                        {/* Status indicator dot */}
                        <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                          component.status === 'active' ? 'bg-green-500' : 'bg-slate-600'
                        }`}>
                          {component.status === 'active' && (
                            <motion.div 
                              className="absolute inset-0 w-2 h-2 rounded-full bg-green-500"
                              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}
                        </div>

                        {/* Icon */}
                        <div className={`mx-auto mb-2 w-8 h-8 rounded flex items-center justify-center ${
                          component.status === 'active' 
                            ? 'bg-slate-700 text-green-400' 
                            : 'bg-slate-900/50 text-slate-400'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        
                        {/* Component name */}
                        <div className="text-[10px] font-medium text-slate-300 leading-tight">
                          {component.name}
                        </div>
                        
                        {/* Metrics */}
                        {component.metrics && (
                          <div className="mt-1 text-[8px] text-slate-500 font-mono">
                            {component.metrics.throughput || component.metrics.accuracy || component.metrics.latency}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </foreignObject>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Event Log & Controls */}
        <div className="space-y-4">
          {/* Demo Scenarios */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Demo Scenarios
            </h3>
            <div className="space-y-3">
              {[
                { 
                  id: 'black_friday', 
                  name: 'Black Friday Rush Hour', 
                  description: 'Watch CDP handle 3x traffic surge', 
                  color: 'bg-red-500',
                  detail: 'POS → Kafka → Spark → ML → Optimization'
                },
                { 
                  id: 'staff_shortage', 
                  name: 'Staff Shortage Response', 
                  description: 'Real-time reallocation when 3 employees call out', 
                  color: 'bg-orange-500',
                  detail: 'Alert → ML Analysis → Auto-reassignment'
                },
                { 
                  id: 'predictive_scheduling', 
                  name: 'Next Week Optimization', 
                  description: 'ML-driven schedule generation', 
                  color: 'bg-green-500',
                  detail: 'Historical → Forecast → Schedule → Validate'
                }
              ].map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => runDemoScenario(scenario.id)}
                  className="w-full text-left p-4 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-blue-50 hover:to-indigo-50 rounded-lg transition-all duration-200 border border-slate-200 hover:border-blue-300 hover:shadow-md"
                >
                  <div className="flex items-center mb-1">
                    <div className={`w-3 h-3 rounded-full ${scenario.color} mr-2`}></div>
                    <div className="font-semibold text-sm text-slate-900">{scenario.name}</div>
                  </div>
                  <div className="text-xs text-slate-600 ml-5 mb-1">{scenario.description}</div>
                  <div className="text-xs text-slate-400 ml-5 font-mono">{scenario.detail}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Live Event Stream */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Live Event Stream
            </h3>
            <div
              ref={eventLogRef}
              className="h-72 overflow-y-auto space-y-2 text-sm bg-slate-900 p-4 rounded-lg border border-slate-700 custom-scrollbar"
            >
              {recentEvents.length === 0 ? (
                <div className="text-slate-400 text-center py-12 flex flex-col items-center">
                  <div className="w-8 h-8 border-2 border-slate-600 border-t-slate-400 rounded-full animate-spin mb-3"></div>
                  <div>Waiting for data streams...</div>
                  <div className="text-xs text-slate-500 mt-1">Real-time events will appear here</div>
                </div>
              ) : (
                recentEvents.map((event, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start space-x-3 p-2 hover:bg-slate-800 rounded transition-colors"
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="text-slate-100 font-mono text-xs leading-relaxed">{event}</div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Business Impact Dashboard */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-100 border border-green-200 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Business Impact Today
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className="text-xs text-slate-500 mb-1">Cost Saved</div>
                <div className="text-xl font-bold text-green-600">
                  ${businessMetrics.costSaved.toLocaleString()}
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <div className="text-xs text-slate-500 mb-1">Efficiency Gain</div>
                <div className="text-xl font-bold text-blue-600">
                  {businessMetrics.efficiencyGain}%
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <div className="text-xs text-slate-500 mb-1">Predictions Made</div>
                <div className="text-xl font-bold text-purple-600">
                  {businessMetrics.predictionsToday.toLocaleString()}
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-orange-200">
                <div className="text-xs text-slate-500 mb-1">Staff Optimized</div>
                <div className="text-xl font-bold text-orange-600">
                  {businessMetrics.staffOptimized}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-green-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Issues Prevented</span>
                <span className="text-lg font-semibold text-red-600">{businessMetrics.issuesPrevented}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-slate-600">Customer Satisfaction</span>
                <span className="text-lg font-semibold text-indigo-600">
                  {businessMetrics.customerSatisfaction > 0 ? `+${businessMetrics.customerSatisfaction}%` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* System Metrics */}
          <div className="bg-gradient-to-r from-cdp-blue to-cdp-dark text-white rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">CDP Platform Metrics</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm opacity-90">Active Components</span>
                <span className="text-sm font-mono">
                  {components.filter(c => c.status === 'active').length}/{components.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm opacity-90">Events/Second</span>
                <span className="text-sm font-mono">45,231</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm opacity-90">Avg Latency</span>
                <span className="text-sm font-mono">0.3s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm opacity-90">ML Accuracy</span>
                <span className="text-sm font-mono">94.2%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataFlowVisualizer;