import React, { useState } from 'react';
import { Play, Pause, FastForward, RotateCcw } from 'lucide-react';

interface DataLineageTrackerProps {
  onTrack: (dataType: string, dataId: string) => void;
  isTracking: boolean;
  currentStage?: string;
  elapsedTime?: number;
  onSpeedChange: (speed: number) => void;
  onPause: () => void;
  onReset: () => void;
}

const dataTypes = [
  { value: 'schedule_change', label: 'Employee Schedule Change' },
  { value: 'traffic_surge', label: 'Customer Traffic Surge' },
  { value: 'inventory_update', label: 'Inventory Update' },
  { value: 'compliance_alert', label: 'Compliance Alert' },
  { value: 'retention_risk', label: 'Retention Risk Signal' }
];

const DataLineageTracker: React.FC<DataLineageTrackerProps> = ({
  onTrack,
  isTracking,
  currentStage,
  elapsedTime = 0,
  onSpeedChange,
  onPause,
  onReset
}) => {
  const [selectedType, setSelectedType] = useState('schedule_change');
  const [dataId, setDataId] = useState('emp_001');
  const [currentSpeed, setCurrentSpeed] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const handleTrack = () => {
    if (selectedType && dataId) {
      onTrack(selectedType, dataId);
      setIsPaused(false);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setCurrentSpeed(speed);
    onSpeedChange(speed);
  };

  const handlePausePlay = () => {
    if (isPaused) {
      handleSpeedChange(currentSpeed);
    } else {
      onPause();
    }
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    onReset();
    setIsPaused(false);
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <h3 className="text-lg font-semibold text-white">Data Lineage Tracker</h3>
        </div>
        {isTracking && currentStage && (
          <div className="text-sm text-gray-400">
            Current Stage: <span className="text-blue-400 font-medium">{currentStage}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Data Type</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isTracking}
          >
            {dataTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Data ID</label>
          <input
            type="text"
            value={dataId}
            onChange={(e) => setDataId(e.target.value)}
            placeholder="e.g., emp_001"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isTracking}
          />
        </div>

        <div className="flex items-end">
          {!isTracking ? (
            <button
              onClick={handleTrack}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-sm transition-colors flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Track Data</span>
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium text-sm transition-colors flex items-center justify-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {isTracking && (
        <div className="space-y-3">
          {/* Timeline */}
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Journey Progress</span>
              <span className="text-xs text-green-400 font-mono">{elapsedTime}ms</span>
            </div>
            <div className="relative">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                  style={{ width: `${Math.min((elapsedTime / 500) * 100, 100)}%` }}
                />
              </div>
              <div className="absolute -top-1 transition-all duration-300"
                   style={{ left: `${Math.min((elapsedTime / 500) * 100, 100)}%`, marginLeft: '-6px' }}>
                <div className="w-3 h-3 bg-white rounded-full shadow-lg"></div>
              </div>
            </div>
          </div>

          {/* Speed Controls */}
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={handlePausePlay}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              {isPaused ? <Play className="w-4 h-4 text-white" /> : <Pause className="w-4 h-4 text-white" />}
            </button>
            
            <div className="flex space-x-2">
              {[1, 2, 5].map(speed => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    currentSpeed === speed && !isPaused
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            <div className="text-sm text-gray-400">
              Speed: <span className="text-white font-medium">{isPaused ? 'Paused' : `${currentSpeed}x`}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataLineageTracker;