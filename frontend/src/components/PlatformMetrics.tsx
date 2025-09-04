import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Database, 
  Brain, 
  Zap, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { PlatformStatus } from '../services/api';

interface PlatformMetricsProps {
  status: PlatformStatus | null;
  isConnected: boolean;
}

interface ComponentMetric {
  name: string;
  status: string;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
  bgColor: string;
}

const PlatformMetrics: React.FC<PlatformMetricsProps> = ({ status, isConnected }) => {
  const [metrics, setMetrics] = useState<ComponentMetric[]>([]);
  const [systemLoad, setSystemLoad] = useState({
    cpu: 45,
    memory: 62,
    network: 38,
    storage: 71
  });

  useEffect(() => {
    if (status) {
      setMetrics([
        {
          name: 'Data Warehouse',
          status: status.data_warehouse,
          icon: Database,
          description: 'DuckDB processing workforce data',
          color: getStatusColor(status.data_warehouse),
          bgColor: getStatusBgColor(status.data_warehouse)
        },
        {
          name: 'ML Platform',
          status: status.ml_platform,
          icon: Brain,
          description: 'AI models for predictions',
          color: getStatusColor(status.ml_platform),
          bgColor: getStatusBgColor(status.ml_platform)
        },
        {
          name: 'DataFlow',
          status: status.data_flow,
          icon: Activity,
          description: 'Real-time data streaming',
          color: getStatusColor(status.data_flow),
          bgColor: getStatusBgColor(status.data_flow)
        }
      ]);
    }

    // Simulate system load changes
    const interval = setInterval(() => {
      setSystemLoad(prev => ({
        cpu: Math.max(20, Math.min(90, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(30, Math.min(85, prev.memory + (Math.random() - 0.5) * 8)),
        network: Math.max(10, Math.min(80, prev.network + (Math.random() - 0.5) * 15)),
        storage: Math.max(50, Math.min(95, prev.storage + (Math.random() - 0.5) * 3))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [status]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'processing': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBgColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-100';
      case 'processing': return 'bg-yellow-100';
      case 'error': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'processing': return Clock;
      case 'error': return AlertTriangle;
      default: return Info;
    }
  };

  const getLoadColor = (value: number): string => {
    if (value >= 80) return 'bg-red-500';
    if (value >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getLoadTextColor = (value: number): string => {
    if (value >= 80) return 'text-red-600';
    if (value >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Platform Status</h2>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>

      {/* Component Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">CDP Components</h3>
        <div className="space-y-3">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            const StatusIcon = getStatusIcon(metric.status);
            
            return (
              <motion.div
                key={metric.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                    <Icon className={`h-5 w-5 ${metric.color}`} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{metric.name}</div>
                    <div className="text-sm text-gray-600">{metric.description}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <StatusIcon className={`h-4 w-4 ${metric.color}`} />
                  <span className={`text-sm font-medium capitalize ${metric.color}`}>
                    {metric.status}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* System Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Resources</h3>
        <div className="space-y-4">
          {Object.entries(systemLoad).map(([resource, value], index) => (
            <motion.div
              key={resource}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 capitalize">{resource}</span>
                <span className={`text-sm font-semibold ${getLoadTextColor(value)}`}>
                  {Math.round(value)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full ${getLoadColor(value)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Platform Stats */}
      {status && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Total Events</span>
              <span className="text-sm font-semibold text-gray-900">
                {status.total_events?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="text-sm font-semibold text-green-600">{status.uptime}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Last Update</span>
              <span className="text-sm font-semibold text-gray-900">
                {status.last_update ? new Date(status.last_update).toLocaleTimeString() : 'Never'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Indicators */}
      <div className="bg-gradient-to-r from-cdp-blue to-cdp-dark text-white rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Real-time Processing</h3>
          <Zap className="h-5 w-5" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-90">Data Processing</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Active</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-90">AI Analysis</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Running</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-90">Data Streaming</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
            <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-blue-900">Optimal Performance</div>
              <div className="text-sm text-blue-700">All systems operating within normal parameters</div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-green-900">Data Quality</div>
              <div className="text-sm text-green-700">High data integrity maintained across all sources</div>
            </div>
          </div>

          {systemLoad.storage > 85 && (
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-yellow-900">Storage Warning</div>
                <div className="text-sm text-yellow-700">Storage utilization approaching capacity limits</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlatformMetrics;