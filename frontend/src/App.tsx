import React, { useState, useEffect } from 'react';
import { Zap, Database, Brain, BarChart3, Users, Calendar, BookOpen } from 'lucide-react';
import DataFlowVisualizer from './components/DataFlowVisualizer';
import SchedulingDashboard from './components/SchedulingDashboard';
import RetentionAnalytics from './components/RetentionAnalytics';
import LearningPathway from './components/LearningPathway';
import PlatformMetrics from './components/PlatformMetrics';
import { api, wsManager, PlatformStatus } from './services/api';

type TabType = 'overview' | 'scheduling' | 'retention' | 'learning';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [platformStatus, setPlatformStatus] = useState<PlatformStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize WebSocket connection
    wsManager.connect();
    
    // Listen for platform status updates
    wsManager.on('system_status', (status: PlatformStatus) => {
      setPlatformStatus(status);
      setIsConnected(true);
    });

    // Fetch initial platform status
    const fetchStatus = async () => {
      try {
        const status = await api.getPlatformStatus();
        setPlatformStatus(status);
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to fetch platform status:', error);
        setIsConnected(false);
      }
    };

    fetchStatus();

    return () => {
      wsManager.disconnect();
    };
  }, []);

  const tabs = [
    { id: 'overview', label: 'CDP Overview', icon: Database },
    { id: 'scheduling', label: 'Smart Scheduling', icon: Calendar },
    { id: 'retention', label: 'Retention Analytics', icon: Users },
    { id: 'learning', label: 'Learning Paths', icon: BookOpen },
  ] as const;

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <DataFlowVisualizer />
              </div>
              <div>
                <PlatformMetrics status={platformStatus} isConnected={isConnected} />
              </div>
            </div>
          </div>
        );
      case 'scheduling':
        return <SchedulingDashboard />;
      case 'retention':
        return <RetentionAnalytics />;
      case 'learning':
        return <LearningPathway />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-8 w-8 text-cdp-blue" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Cloudera Data Platform
                  </h1>
                  <p className="text-sm text-gray-500">Retail Workforce Management Demo</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              {platformStatus && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Uptime:</span> {platformStatus.uptime}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-cdp-blue text-cdp-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-cdp-blue" />
                <span className="text-sm text-gray-600">
                  Powered by Cloudera Data Platform
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-cdp-green" />
                <span className="text-sm text-gray-600">
                  AI-Driven Workforce Management
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Demo Environment • Real-time Analytics
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;