import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Database, Brain, BarChart3, Users, Calendar, BookOpen, Heart, TrendingUp } from 'lucide-react';
import LandingSequence from './components/LandingSequence';
import DataFlowVisualizer from './components/DataFlowVisualizer';
import DataLineageTracker from './components/DataLineageTracker';
import SchedulingDashboard from './components/SchedulingDashboard';
import RetentionAnalytics from './components/RetentionAnalytics';
import LearningPathway from './components/LearningPathway';
import PlatformMetrics from './components/PlatformMetrics';
import SentimentDashboard from './components/SentimentDashboard';
import ExecutiveSummary from './components/ExecutiveSummary';
import MobileSentimentDashboard from './components/mobile/MobileSentimentDashboard';
import { api, wsManager, PlatformStatus } from './services/api';

const isMobileRoute = window.location.pathname === '/mobile';

type TabType = 'overview' | 'executive' | 'sentiment' | 'scheduling' | 'retention' | 'learning';

const LANDING_STORAGE_KEY = 'landing_sequence_shown';

function App() {
  const [showLanding, setShowLanding] = useState(() => {
    if (isMobileRoute) return false;
    return sessionStorage.getItem(LANDING_STORAGE_KEY) !== 'true';
  });
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const handleLandingComplete = useCallback(() => {
    sessionStorage.setItem(LANDING_STORAGE_KEY, 'true');
    setShowLanding(false);
  }, []);
  const [platformStatus, setPlatformStatus] = useState<PlatformStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [currentStage, setCurrentStage] = useState<string>('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(1);

  useEffect(() => {
    if (isMobileRoute) return;
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

    // Listen for lineage tracking updates
    wsManager.on('lineage_tracking', (data: any) => {
      setTrackingData(data);
      if (data.stages && data.stages.length > 0) {
        animateDataJourney(data.stages);
      }
    });

    return () => {
      wsManager.disconnect();
    };
  }, []);

  // Lineage tracking handlers
  const handleTrackData = async (dataType: string, dataId: string) => {
    try {
      setIsTracking(true);
      setElapsedTime(0);
      setCurrentStage('Initializing...');
      
      const response = await fetch('http://localhost:8000/api/lineage/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data_type: dataType, data_id: dataId })
      });
      
      const data = await response.json();
      if (data.success) {
        setTrackingData(data);
        animateDataJourney(data.stages);
      }
    } catch (error) {
      console.error('Failed to track data:', error);
      setIsTracking(false);
    }
  };

  const animateDataJourney = (stages: any[]) => {
    let currentIndex = 0;
    let currentTime = 0;
    
    const animateStage = () => {
      if (currentIndex < stages.length) {
        const stage = stages[currentIndex];
        setCurrentStage(stage.component);
        
        // Simulate progress through the stage
        const duration = stage.duration / animationSpeed;
        const steps = 10;
        const stepDuration = duration / steps;
        let step = 0;
        
        const progressInterval = setInterval(() => {
          step++;
          currentTime += stepDuration;
          setElapsedTime(Math.round(currentTime));
          
          if (step >= steps) {
            clearInterval(progressInterval);
            currentIndex++;
            if (currentIndex < stages.length) {
              setTimeout(animateStage, 100 / animationSpeed);
            } else {
              setCurrentStage('Complete');
              setTimeout(() => {
                setIsTracking(false);
              }, 2000);
            }
          }
        }, stepDuration);
      }
    };
    
    animateStage();
  };

  const handleSpeedChange = (speed: number) => {
    setAnimationSpeed(speed);
  };

  const handlePause = () => {
    // Pause animation logic
    setAnimationSpeed(0);
  };

  const handleReset = () => {
    setIsTracking(false);
    setTrackingData(null);
    setCurrentStage('');
    setElapsedTime(0);
    setAnimationSpeed(1);
  };

  if (isMobileRoute) {
    return <MobileSentimentDashboard />;
  }

  if (showLanding) {
    return <LandingSequence onComplete={handleLandingComplete} />;
  }

  const tabs = [
    { id: 'overview', label: 'CDP Overview', icon: Database },
    { id: 'executive', label: 'Executive Summary', icon: TrendingUp },
    { id: 'sentiment', label: 'Sentiment Analysis', icon: Heart },
    { id: 'scheduling', label: 'Smart Scheduling', icon: Calendar },
    { id: 'retention', label: 'Retention Analytics', icon: Users },
    { id: 'learning', label: 'Learning Paths', icon: BookOpen },
  ] as const;

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DataFlowVisualizer />;
      case 'executive':
        return <ExecutiveSummary />;
      case 'sentiment':
        return <SentimentDashboard />;
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
                  <p className="text-sm text-gray-500">Retail Workforce Management System</p>
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
              Real-time Analytics
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;