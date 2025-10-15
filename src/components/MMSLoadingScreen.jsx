import { useState, useEffect } from 'react';

const MMSLoadingScreen = ({ isDataReady = false }) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [activities, setActivities] = useState([]);

  const stages = [
    {
      id: 0,
      icon: '🔐',
      title: 'Authenticating with Perk Database',
      subtitle: 'Establishing secure connection...',
      duration: 1000,
      color: '#5A1F06'
    },
    {
      id: 1,
      icon: '🎯',
      title: 'Filtering M&M\'S Fun Club Members',
      subtitle: 'program_id: 10000154',
      duration: 900,
      color: '#FFD200'
    },
    {
      id: 2,
      icon: '📊',
      title: 'Querying Recent Activities',
      subtitle: 'Sorting by timestamp DESC...',
      duration: 1000,
      color: '#0E74E1'
    },
    {
      id: 3,
      icon: '🌍',
      title: 'Geocoding Locations',
      subtitle: 'Resolving IP addresses & cities...',
      duration: 1100,
      color: '#00A836'
    },
    {
      id: 4,
      icon: '✨',
      title: 'Loading Activities',
      subtitle: 'Preparing globe visualization...',
      duration: Infinity, // Wait for real data
      color: '#FA6400'
    }
  ];

  // Mock activity examples that appear during loading
  const mockActivities = [
    { text: 'Sarah from Brooklyn submitted a receipt', icon: '🛒', color: '#00A836' },
    { text: 'Mike in Austin earned 50 points', icon: '⭐', color: '#FA6400' },
    { text: 'Jessica from Miami watched a video', icon: '📺', color: '#0E74E1' },
    { text: 'David in Seattle played a game', icon: '🎮', color: '#FA6400' },
    { text: 'Emma from Boston joined Fun Club', icon: '✨', color: '#5A1F06' },
    { text: 'Alex in Portland completed a quiz', icon: '🧠', color: '#0E74E1' },
    { text: 'Rachel from Denver redeemed a reward', icon: '🏆', color: '#FFD200' },
    { text: 'Chris in Phoenix shared socially', icon: '🔁', color: '#FA6400' }
  ];

  // Progress through stages
  useEffect(() => {
    if (currentStage >= stages.length) return;

    // On the last stage, wait for data to be ready
    if (currentStage === stages.length - 1 && isDataReady) {
      const timer = setTimeout(() => {
        setCurrentStage(prev => prev + 1);
      }, 300); // Small delay for smooth transition
      return () => clearTimeout(timer);
    }

    // For other stages, progress normally
    if (currentStage < stages.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStage(prev => prev + 1);
      }, stages[currentStage].duration);
      return () => clearTimeout(timer);
    }
  }, [currentStage, isDataReady]);

  // Add mock activities progressively
  useEffect(() => {
    if (currentStage < 2) return; // Start after query stage

    const interval = setInterval(() => {
      if (activities.length < mockActivities.length) {
        setActivities(prev => [...prev, mockActivities[prev.length]]);
      }
    }, 350);

    return () => clearInterval(interval);
  }, [currentStage, activities.length]);

  if (currentStage >= stages.length) {
    return null; // Loading complete
  }

  const currentStageData = stages[currentStage];
  const progress = ((currentStage + 1) / stages.length) * 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #FFD200 0%, #FFA500 100%)',
        fontFamily: '"All Together Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
      }}
    >
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div
          className="absolute rounded-full"
          style={{
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
            top: '10%',
            left: '10%',
            animation: 'float 6s ease-in-out infinite'
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
            bottom: '10%',
            right: '10%',
            animation: 'float 8s ease-in-out infinite reverse'
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-2xl w-full px-6">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fun-club-logo-var2-4iEoRI3BA3ArXmhgtSawr5k2b5jp57.svg"
            alt="M&M'S Fun Club"
            className="h-20 w-auto drop-shadow-2xl"
            style={{ animation: 'pulse 2s ease-in-out infinite' }}
          />
        </div>

        {/* Current stage card */}
        <div
          className="bg-white rounded-2xl shadow-2xl p-8 mb-6"
          style={{ animation: 'slideIn 0.4s ease-out' }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">
              {currentStageData.icon}
            </div>
            <div className="flex-1">
              <h2
                className="text-2xl font-bold mb-1"
                style={{
                  color: currentStageData.color,
                  fontFamily: '"All Together Serif", serif'
                }}
              >
                {currentStageData.title}
              </h2>
              <p className="text-gray-600 font-mono text-sm">
                {currentStageData.subtitle}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${currentStageData.color} 0%, ${currentStageData.color}dd 100%)`
              }}
            >
              <div
                className="absolute inset-0 opacity-50"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                  animation: 'shimmer 1.5s ease-in-out infinite'
                }}
              />
            </div>
          </div>

          <div className="mt-2 text-right text-sm font-semibold" style={{ color: currentStageData.color }}>
            {currentStage + 1} / {stages.length}
          </div>
        </div>

        {/* Live activity feed */}
        {activities.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 max-h-64 overflow-hidden">
            <div className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">
              📡 Live Activity Stream
            </div>
            <div className="space-y-2">
              {activities.slice(-5).reverse().map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 rounded-lg bg-white border border-gray-100"
                  style={{
                    animation: `slideIn 0.3s ease-out`,
                    borderLeftColor: activity.color,
                    borderLeftWidth: '3px'
                  }}
                >
                  <span className="text-xl">{activity.icon}</span>
                  <span className="text-sm text-gray-700 flex-1">{activity.text}</span>
                  <span
                    className="text-xs font-bold px-2 py-1 rounded"
                    style={{
                      backgroundColor: `${activity.color}20`,
                      color: activity.color
                    }}
                  >
                    NEW
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stage indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {stages.map((stage, index) => (
            <div
              key={stage.id}
              className="transition-all duration-300"
              style={{
                width: index === currentStage ? '40px' : '12px',
                height: '12px',
                borderRadius: '6px',
                backgroundColor: index <= currentStage ? stage.color : 'rgba(255,255,255,0.4)',
                boxShadow: index === currentStage ? `0 0 10px ${stage.color}` : 'none'
              }}
            />
          ))}
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes slideIn {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
      `}</style>
    </div>
  );
};

export default MMSLoadingScreen;
