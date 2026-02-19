import React from 'react';
import { Home, Calendar, DollarSign, Clock, Heart, User, ChevronLeft } from 'lucide-react';

interface MobileAppShellProps {
  children: React.ReactNode;
  activeTab?: string;
}

const MobileAppShell: React.FC<MobileAppShellProps> = ({ children, activeTab = 'sentiment' }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'pay', label: 'Pay', icon: DollarSign },
    { id: 'time', label: 'Time Off', icon: Clock },
    { id: 'sentiment', label: 'Sentiment', icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col max-w-md mx-auto shadow-2xl">
      {/* me@Walmart Header */}
      <header className="bg-[#0071ce] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <ChevronLeft className="h-6 w-6" />
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#ffc220] rounded-full flex items-center justify-center">
              <span className="text-[#0071ce] font-bold text-sm">W</span>
            </div>
            <div>
              <p className="font-semibold text-sm">me@Walmart</p>
              <p className="text-xs text-blue-200">Store #4523</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <User className="h-5 w-5" />
          </div>
        </div>
      </header>

      {/* Page Title */}
      <div className="bg-[#0071ce] text-white px-4 pb-4">
        <h1 className="text-xl font-bold">Team Sentiment</h1>
        <p className="text-blue-200 text-sm">AI-powered workforce insights</p>
      </div>

      {/* Content Area */}
      <main className="flex-1 overflow-auto bg-gray-50">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 px-2 py-2 sticky bottom-0">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeTab;
            return (
              <button
                key={item.id}
                className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-[#0071ce] bg-blue-50' 
                    : 'text-gray-500'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-[#0071ce]' : ''}`} />
                <span className={`text-xs mt-1 ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default MobileAppShell;
