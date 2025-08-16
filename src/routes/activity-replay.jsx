import { useEffect, useRef, useState, useCallback } from 'react';
import Globe from 'react-globe.gl';
import { useActivityGlobeData } from '../hooks/useActivityGlobeData';

const ActivityReplay = () => {
  const globeEl = useRef();
  const { points, isLoading, error } = useActivityGlobeData({ limit: 30 });
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(3000); // ms between activities
  const [visiblePoints, setVisiblePoints] = useState([]);
  const [activeRings, setActiveRings] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const intervalRef = useRef(null);
  const interactionTimeoutRef = useRef(null);

  // Sort points chronologically (oldest first for replay)
  const sortedPoints = points.slice().sort((a, b) => a.timestamp - b.timestamp);

  useEffect(() => {
    if (!globeEl.current) return;
    
    globeEl.current.controls().autoRotate = true;
    globeEl.current.controls().autoRotateSpeed = 0.2;
    
    const directionalLight = globeEl.current
      .scene()
      .children.find((obj3d) => obj3d.type === 'DirectionalLight');
    if (directionalLight) {
      directionalLight.intensity = 0.8;
    }

    // Handle responsive sizing
    const handleResize = () => {
      const newDimensions = {
        width: window.innerWidth,
        height: window.innerHeight
      };
      setDimensions(newDimensions);
      setIsMobile(window.innerWidth < 768);
      
      if (globeEl.current) {
        globeEl.current
          .width(newDimensions.width)
          .height(newDimensions.height);
      }
    };
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const getActivityType = (activityText) => {
    const text = activityText.toLowerCase();
    
    if (text.includes('playing a game') || text.includes('game')) {
      return { icon: '🎮', color: '#22c55e' };
    } else if (text.includes('signing in') || text.includes('signed in')) {
      return { icon: '🔑', color: '#3b82f6' };
    } else if (text.includes('quiz') || text.includes('finishing a quiz')) {
      return { icon: '🧠', color: '#8b5cf6' };
    } else if (text.includes('joining') || text.includes('joined')) {
      return { icon: '✨', color: '#f59e0b' };
    } else if (text.includes('earning a reward') || text.includes('reward')) {
      return { icon: '🏆', color: '#ef4444' };
    } else if (text.includes('clicking a link') || text.includes('link')) {
      return { icon: '🔗', color: '#06b6d4' };
    } else if (text.includes('reading an article') || text.includes('article')) {
      return { icon: '📖', color: '#84cc16' };
    } else if (text.includes('watching a video') || text.includes('video')) {
      return { icon: '📺', color: '#ec4899' };
    } else if (text.includes('answering a profile') || text.includes('profile')) {
      return { icon: '👤', color: '#6366f1' };
    } else if (text.includes('viewing a post') || text.includes('post')) {
      return { icon: '👁️', color: '#10b981' };
    } else if (text.includes('spent') || text.includes('redeem')) {
      return { icon: '💰', color: '#f97316' };
    } else {
      return { icon: '⭐', color: '#22c55e' };
    }
  };

  const pauseReplay = useCallback(() => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startReplay = useCallback(() => {
    if (sortedPoints.length === 0) return;
    
    setIsPlaying(true);
    setCurrentIndex(0);
    setVisiblePoints([]);
    setActiveRings([]);
    
    // Show first activity immediately
    const firstPoint = sortedPoints[0];
    setVisiblePoints([{ ...firstPoint, id: 0 }]);
    
    // Add animated green ring for first activity
    const firstRing = {
      id: 0,
      lat: firstPoint.lat,
      lng: firstPoint.lon,
      radius: 12,
      color: '#22c55e',
      speed: 6,
      repeat: 1500,
      timestamp: Date.now()
    };
    setActiveRings([firstRing]);
    
    // Set first activity card
    const firstActivityType = getActivityType(firstPoint.label);
    const firstCardData = {
      id: 0,
      lat: firstPoint.lat,
      lng: firstPoint.lon,
      text: firstPoint.label,
      icon: firstActivityType.icon,
      timestamp: Date.now()
    };
    setCurrentCard(firstCardData);
    
    // Focus globe on first activity
    if (globeEl.current) {
      globeEl.current.pointOfView({
        lat: firstPoint.lat,
        lng: firstPoint.lon,
        altitude: 1.8
      }, 1000);
    }
    
    // Clear first card after duration
    setTimeout(() => {
      if (sortedPoints.length > 1) {
        setCurrentCard(null);
      }
    }, playbackSpeed - 200);
    
    // Set up interval for subsequent activities
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = prevIndex + 1;
        
        if (nextIndex >= sortedPoints.length) {
          // Auto-restart the replay for continuous loop
          setCurrentIndex(0);
          setVisiblePoints([]);
          setActiveRings([]);
          setCurrentCard(null);
          return 0;
        }
        
        const point = sortedPoints[nextIndex];
        
        // Add new point to visible points
        setVisiblePoints(prev => [...prev, { ...point, id: nextIndex }]);
        
        // Add animated green ring for this activity
        const ring = {
          id: nextIndex,
          lat: point.lat,
          lng: point.lon,
          radius: 12,
          color: '#22c55e', // Green color
          speed: 6,
          repeat: 1500,
          timestamp: Date.now()
        };
        setActiveRings(prev => [...prev, ring]);
        
        // Set current activity card (separate from pulsing rings)
        const activityType = getActivityType(point.label);
        const cardData = {
          id: nextIndex,
          lat: point.lat,
          lng: point.lon,
          text: point.label,
          icon: activityType.icon,
          timestamp: Date.now()
        };
        setCurrentCard(cardData);
        
        // Clear current card after duration (except if it's the last activity)
        setTimeout(() => {
          if (nextIndex < sortedPoints.length - 1) {
            setCurrentCard(null);
          }
        }, playbackSpeed - 200);
        
        // Focus globe on this activity
        if (globeEl.current) {
          globeEl.current.pointOfView({
            lat: point.lat,
            lng: point.lon,
            altitude: 1.8
          }, 1000);
        }
        
        return nextIndex;
      });
    }, playbackSpeed);
  }, [sortedPoints, playbackSpeed]);

  // Handle user interactions with globe
  const handleGlobeClick = useCallback((pointData, event) => {
    if (!pointData) return;
    
    // Pause current replay
    setUserInteracted(true);
    pauseReplay();
    
    // Show card for clicked point
    const activityType = getActivityType(pointData.label);
    const cardData = {
      id: pointData.id,
      lat: pointData.lat,
      lng: pointData.lon,
      text: pointData.label,
      icon: activityType.icon,
      timestamp: Date.now()
    };
    setCurrentCard(cardData);
    
    // Focus on clicked point
    if (globeEl.current) {
      globeEl.current.pointOfView({
        lat: pointData.lat,
        lng: pointData.lon,
        altitude: 1.8
      }, 1000);
    }
    
    // Clear previous timeout
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
    
    // Resume auto-play after 5 seconds
    interactionTimeoutRef.current = setTimeout(() => {
      setCurrentCard(null);
      setUserInteracted(false);
      startReplay();
    }, 5000);
  }, [pauseReplay, startReplay]);

  // Auto-start replay when data loads
  useEffect(() => {
    if (sortedPoints.length > 0 && !isPlaying && !userInteracted) {
      startReplay();
    }
  }, [sortedPoints, startReplay, isPlaying, userInteracted]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, []);

  // Clean up old rings periodically
  useEffect(() => {
    const cleanup = setInterval(() => {
      setActiveRings(prev => 
        prev.filter(ring => Date.now() - ring.timestamp < 3000)
      );
    }, 1000);
    
    return () => clearInterval(cleanup);
  }, []);

  return (
    <div className="relative w-full h-screen bg-gray-900">
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        width={dimensions.width}
        height={dimensions.height}
        
        // Static points for activities that have been shown
        pointsData={visiblePoints}
        pointLat={(p) => p.lat}
        pointLng={(p) => p.lon}
        pointColor={() => '#22c55e'} // Green points
        pointAltitude={0.02}
        pointRadius={0.4}
        onPointClick={handleGlobeClick}
        
        // Animated green rings for current activity
        ringsData={activeRings}
        ringMaxRadius="radius"
        ringColor={() => (time) => `rgba(34, 197, 94, ${Math.sqrt(1 - time) * 0.9})`}
        ringPropagationSpeed="speed"
        ringRepeatPeriod="repeat"
        ringLat="lat"
        ringLng="lng"
        
      />
      
      {/* Independent Activity Card Overlay - Not connected to Globe */}
      {currentCard && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div 
            className="absolute left-1/2 transform -translate-x-1/2"
            style={{
              // Mobile-first positioning: upper third on mobile, center on desktop
              top: isMobile ? '30%' : '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '16px',
              padding: isMobile ? '12px 16px' : '16px 20px',
              maxWidth: isMobile ? '280px' : '320px',
              minWidth: isMobile ? '200px' : '240px',
              margin: isMobile ? '0 16px' : '0',
              boxShadow: `
                0 8px 32px rgba(0, 0, 0, 0.4),
                inset 0 1px 0 rgba(255, 255, 255, 0.2)
              `,
              animation: 'cardSlideIn 0.6s ease-out forwards'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.25)',
                borderRadius: '8px',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '32px',
                height: '32px',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                fontSize: '16px'
              }}>
                {currentCard.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  color: '#ffffff',
                  lineHeight: '1.4',
                  wordWrap: 'break-word',
                  fontWeight: '500',
                  fontSize: isMobile ? '13px' : '14px',
                  fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                }}>
                  {currentCard.text}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* CSS for card animations */}
      <style jsx>{`
        @keyframes cardSlideIn {
          0% {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
      
      {/* Perk Logo */}
      <div className="absolute top-6 right-6 z-40">
        <img 
          src="/Perk Logo Gold Primary.svg" 
          alt="Perk"
          className="h-12 w-auto opacity-90 hover:opacity-100 transition-opacity duration-300"
          style={{
            filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))'
          }}
        />
      </div>

      {/* Hidden debug info - only show if there's an error */}
      {error && (
        <div className="absolute top-4 left-4 bg-red-900/80 text-white p-3 rounded-lg text-sm">
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default ActivityReplay;