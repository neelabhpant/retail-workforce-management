import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Receipt, 
  Users, 
  Calendar, 
  ClipboardList, 
  GraduationCap, 
  DollarSign,
  Database,
  Zap
} from 'lucide-react';

const FRAME_DURATIONS = {
  frame1: 8000,
  frame2: 18000,
  frame3: 18000,
  frame4: 6000,
};

interface LandingSequenceProps {
  onComplete: () => void;
}

const systemIcons = [
  { Icon: Receipt, label: 'POS System', color: '#00b894' },
  { Icon: Users, label: 'HR/Workday', color: '#0066cc' },
  { Icon: Calendar, label: 'Scheduling', color: '#6c5ce7' },
  { Icon: ClipboardList, label: 'Surveys', color: '#fd79a8' },
  { Icon: GraduationCap, label: 'Training/LMS', color: '#fdcb6e' },
  { Icon: DollarSign, label: 'Payroll', color: '#e17055' },
];

const scatteredPositions = [
  { x: -280, y: -180 },
  { x: 280, y: -160 },
  { x: -320, y: 40 },
  { x: 300, y: 60 },
  { x: -240, y: 200 },
  { x: 260, y: 180 },
];

const Frame1: React.FC = () => (
  <motion.div
    className="flex flex-col items-center justify-center h-full"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 1.2 }}
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, duration: 1 }}
      className="mb-8"
    >
      <div className="flex items-center justify-center space-x-4">
        <Zap className="h-16 w-16 text-cdp-blue" />
        <Database className="h-14 w-14 text-cdp-green" />
      </div>
    </motion.div>
    
    <motion.h1
      className="text-6xl font-bold text-white mb-6 text-center"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1, duration: 0.8 }}
    >
      Retail Workforce Intelligence
    </motion.h1>
    
    <motion.p
      className="text-2xl text-gray-300 text-center"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.5, duration: 0.8 }}
    >
      Powered by Cloudera Data Platform
    </motion.p>
    
    <motion.div
      className="mt-12 flex items-center space-x-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.5, duration: 1 }}
    >
      <div className="w-2 h-2 bg-cdp-blue rounded-full animate-pulse" />
      <div className="w-2 h-2 bg-cdp-green rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
      <div className="w-2 h-2 bg-cdp-purple rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
    </motion.div>
  </motion.div>
);

const Frame2: React.FC = () => (
  <motion.div
    className="flex flex-col items-center justify-center h-full relative"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.8 }}
  >
    <div className="relative w-full h-[500px] flex items-center justify-center">
      {systemIcons.map((item, index) => {
        const pos = scatteredPositions[index];
        return (
          <motion.div
            key={item.label}
            className="absolute flex flex-col items-center"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              x: pos.x,
              y: pos.y,
            }}
            transition={{ 
              delay: 0.3 + index * 0.15,
              duration: 0.6,
              type: 'spring',
              stiffness: 100
            }}
          >
            <motion.div
              className="p-5 rounded-2xl bg-gray-800/80 border border-gray-700 shadow-lg"
              animate={{ 
                y: [0, -8, 0],
              }}
              transition={{
                duration: 3 + index * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{ boxShadow: `0 0 20px ${item.color}40` }}
            >
              <item.Icon className="h-10 w-10" style={{ color: item.color }} />
            </motion.div>
            <motion.span 
              className="mt-3 text-sm text-gray-400 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 + index * 0.1 }}
            >
              {item.label}
            </motion.span>
          </motion.div>
        );
      })}
      
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 1.5 }}
      >
        <div className="text-8xl text-gray-700">?</div>
      </motion.div>
    </div>
    
    <motion.div
      className="absolute bottom-24 text-center px-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2, duration: 0.8 }}
    >
      <h2 className="text-4xl font-bold text-white mb-4">
        Retail employee data lives in 6+ disconnected systems
      </h2>
      <p className="text-xl text-gray-400">
        None of them talk to each other
      </p>
    </motion.div>
  </motion.div>
);

const Frame3: React.FC = () => {
  const [showStreams, setShowStreams] = useState(false);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const streamTimer = setTimeout(() => setShowStreams(true), 1500);
    const textTimer = setTimeout(() => setShowText(true), 3500);
    return () => {
      clearTimeout(streamTimer);
      clearTimeout(textTimer);
    };
  }, []);

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="relative w-full h-[500px] flex items-center justify-center">
        <motion.div
          className="absolute z-10 p-8 rounded-full bg-gradient-to-br from-cdp-blue to-cdp-dark border-4 border-cdp-blue shadow-2xl"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8, type: 'spring' }}
          style={{ boxShadow: '0 0 60px rgba(0, 102, 204, 0.5)' }}
        >
          <Database className="h-16 w-16 text-white" />
        </motion.div>
        
        <motion.div
          className="absolute z-10 mt-32 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <span className="text-lg font-semibold text-cdp-blue">Cloudera CDP</span>
        </motion.div>

        {systemIcons.map((item, index) => {
          const startPos = scatteredPositions[index];
          const angle = (index / systemIcons.length) * 2 * Math.PI - Math.PI / 2;
          const endRadius = 180;
          const endX = Math.cos(angle) * endRadius;
          const endY = Math.sin(angle) * endRadius;
          
          return (
            <React.Fragment key={item.label}>
              <motion.div
                className="absolute flex flex-col items-center"
                initial={{ x: startPos.x, y: startPos.y, opacity: 1 }}
                animate={{ x: endX, y: endY }}
                transition={{ 
                  delay: 0.3 + index * 0.1,
                  duration: 1.5,
                  type: 'spring',
                  stiffness: 50,
                  damping: 15
                }}
              >
                <motion.div
                  className="p-4 rounded-xl bg-gray-800/90 border border-gray-600 shadow-lg"
                  animate={showStreams ? { 
                    boxShadow: [`0 0 10px ${item.color}40`, `0 0 25px ${item.color}60`, `0 0 10px ${item.color}40`]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <item.Icon className="h-8 w-8" style={{ color: item.color }} />
                </motion.div>
                <span className="mt-2 text-xs text-gray-400">{item.label}</span>
              </motion.div>

              {showStreams && (
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ overflow: 'visible' }}
                >
                  <defs>
                    <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={item.color} stopOpacity="0" />
                      <stop offset="50%" stopColor={item.color} stopOpacity="1" />
                      <stop offset="100%" stopColor="#0066cc" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                  <motion.line
                    x1="50%"
                    y1="50%"
                    x2={`calc(50% + ${endX}px)`}
                    y2={`calc(50% + ${endY}px)`}
                    stroke={`url(#gradient-${index})`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.8 }}
                    transition={{ delay: index * 0.15, duration: 1 }}
                  />
                  <motion.circle
                    r="4"
                    fill={item.color}
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      cx: [`calc(50% + ${endX}px)`, `calc(50% + ${endX * 0.5}px)`, `calc(50% + ${endX * 0.2}px)`, '50%'],
                      cy: [`calc(50% + ${endY}px)`, `calc(50% + ${endY * 0.5}px)`, `calc(50% + ${endY * 0.2}px)`, '50%'],
                    }}
                    transition={{
                      delay: 0.5 + index * 0.2,
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                    style={{ filter: `drop-shadow(0 0 6px ${item.color})` }}
                  />
                </svg>
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      <AnimatePresence>
        {showText && (
          <motion.div
            className="absolute bottom-24 text-center px-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Cloudera connects it all — securely, where your data lives
            </h2>
            <p className="text-xl text-gray-400">
              Real-time ingestion. Unified governance. AI-ready.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Frame4: React.FC = () => (
  <motion.div
    className="flex flex-col items-center justify-center h-full"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.8 }}
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="text-center"
    >
      <motion.h2
        className="text-5xl font-bold text-white mb-8"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        What becomes possible when data is connected?
      </motion.h2>
      
      <motion.div
        className="flex items-center justify-center space-x-3 mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <motion.div
          className="w-3 h-3 bg-cdp-blue rounded-full"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.2 }}
        />
        <motion.div
          className="w-3 h-3 bg-cdp-green rounded-full"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.2, delay: 0.2 }}
        />
        <motion.div
          className="w-3 h-3 bg-cdp-purple rounded-full"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.2, delay: 0.4 }}
        />
      </motion.div>
    </motion.div>
  </motion.div>
);

const LandingSequence: React.FC<LandingSequenceProps> = ({ onComplete }) => {
  const [currentFrame, setCurrentFrame] = useState(1);

  useEffect(() => {
    const durations = [
      FRAME_DURATIONS.frame1,
      FRAME_DURATIONS.frame2,
      FRAME_DURATIONS.frame3,
      FRAME_DURATIONS.frame4,
    ];

    if (currentFrame <= 4) {
      const timer = setTimeout(() => {
        if (currentFrame < 4) {
          setCurrentFrame(currentFrame + 1);
        } else {
          onComplete();
        }
      }, durations[currentFrame - 1]);

      return () => clearTimeout(timer);
    }
  }, [currentFrame, onComplete]);

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900" />
      
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cdp-blue/20 rounded-full filter blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cdp-purple/20 rounded-full filter blur-3xl" />
      </div>

      <div className="relative h-full">
        <AnimatePresence mode="wait">
          {currentFrame === 1 && <Frame1 key="frame1" />}
          {currentFrame === 2 && <Frame2 key="frame2" />}
          {currentFrame === 3 && <Frame3 key="frame3" />}
          {currentFrame === 4 && <Frame4 key="frame4" />}
        </AnimatePresence>
      </div>

      <motion.button
        onClick={handleSkip}
        className="fixed bottom-8 right-8 px-6 py-3 bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg border border-gray-600 transition-colors duration-200 font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Skip Intro →
      </motion.button>

      <div className="fixed bottom-8 left-8 flex space-x-2">
        {[1, 2, 3, 4].map((frame) => (
          <div
            key={frame}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              frame === currentFrame ? 'bg-cdp-blue' : frame < currentFrame ? 'bg-gray-500' : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default LandingSequence;
