import { useEffect, useRef, useState, useCallback } from 'react';
import Globe from 'react-globe.gl';
import { useMMSGlobeData } from '../hooks/useMMSGlobeData';
import MMSLoadingScreen from '../components/MMSLoadingScreen';

const MMSGlobe = () => {
  const globeEl = useRef();
  const { points, isLoading, error, isLoadingMore, totalFetched, maxTotal, isDataReady } = useMMSGlobeData();
  
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
  const [currentTime, setCurrentTime] = useState(Date.now());
  const intervalRef = useRef(null);
  const interactionTimeoutRef = useRef(null);
  const timeUpdateRef = useRef(null);

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

  // Extract points from activity text
  const extractPoints = (activityText) => {
    // Match patterns like "earned 50 points" or "50 points" or "+50"
    const earnedMatch = activityText.match(/earned\s+(\d+)\s+points?/i);
    if (earnedMatch) return `+${earnedMatch[1]} points`;

    const spentMatch = activityText.match(/spent\s+(\d+)\s+points?/i);
    if (spentMatch) return `-${spentMatch[1]} points`;

    const redeemedMatch = activityText.match(/redeemed?\s+(\d+)\s+points?/i);
    if (redeemedMatch) return `-${redeemedMatch[1]} points`;

    const pointsMatch = activityText.match(/(\d+)\s+points?/i);
    if (pointsMatch) return `${pointsMatch[1]} points`;

    const plusMatch = activityText.match(/\+(\d+)/);
    if (plusMatch) return `+${plusMatch[1]} points`;

    const minusMatch = activityText.match(/-(\d+)/);
    if (minusMatch) return `-${minusMatch[1]} points`;

    return null;
  };

  // Format relative timestamp (e.g., "20s ago", "3min ago", "today", "recently")
  const getRelativeTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days >= 1) return 'recently'; // Over 24 hours
    if (hours >= 2) return 'today'; // Over 2 hours
    if (hours >= 1) return `${hours}hr ago`; // 1+ hours
    if (minutes >= 1) return `${minutes}min ago`; // 1+ minutes
    return `${Math.max(1, seconds)}s ago`; // Seconds (minimum 1s)
  };

  const getActivityType = (activityText) => {
    const text = activityText.toLowerCase();

    // M&M's Brand Colors:
    // Brown #5A1F06 → account and system
    // Yellow #FFD200 → rewards, tiers, achievements
    // Green #00A836 → receipts and commerce proof
    // Blue #0E74E1 → content, education, info, messaging
    // Orange #FA6400 → social, UGC, games, general activity
    // Red #D70100 → negative points changes

    // Commerce (Green #00A836)
    if (text.includes('purchase') || text.includes('receipt') || text.includes('submitted a receipt')) {
      return { icon: '🛒', color: '#00A836' };
    }

    // Rewards and Tiers (Yellow #FFD200)
    if (text.includes('reward') || text.includes('tier') || text.includes('achievement') || text.includes('level')) {
      return { icon: '🏆', color: '#FFD200' };
    }

    // Content/Education (Blue #0E74E1)
    if (text.includes('video') || text.includes('watching') || text.includes('watched')) {
      return { icon: '📺', color: '#0E74E1' };
    }
    if (text.includes('article') || text.includes('reading') || text.includes('read')) {
      return { icon: '📖', color: '#0E74E1' };
    }
    if (text.includes('quiz') || text.includes('survey')) {
      return { icon: '🧠', color: '#0E74E1' };
    }
    if (text.includes('link') || text.includes('url') || text.includes('visited')) {
      return { icon: '🔗', color: '#0E74E1' };
    }
    if (text.includes('post') || text.includes('feed') || text.includes('viewed')) {
      return { icon: '👁️', color: '#0E74E1' };
    }

    // Social/Games/Activity (Orange #FA6400)
    if (text.includes('game') || text.includes('played') || text.includes('playing')) {
      return { icon: '🎮', color: '#FA6400' };
    }
    if (text.includes('share') || text.includes('shared') || text.includes('social')) {
      return { icon: '🔁', color: '#FA6400' };
    }
    if (text.includes('connect') || text.includes('recruit') || text.includes('friend')) {
      return { icon: '👥', color: '#FA6400' };
    }

    // Account/System (Brown #5A1F06)
    if (text.includes('sign') || text.includes('signed in') || text.includes('login')) {
      return { icon: '🔑', color: '#5A1F06' };
    }
    if (text.includes('join') || text.includes('joined') || text.includes('sign up')) {
      return { icon: '✨', color: '#5A1F06' };
    }
    if (text.includes('profile') || text.includes('onboarding')) {
      return { icon: '👤', color: '#5A1F06' };
    }

    // Points (context-dependent)
    if (text.includes('earned') || text.includes('points')) {
      return { icon: '⭐', color: '#FA6400' }; // Orange for positive activity
    }
    if (text.includes('spent') || text.includes('redeem')) {
      return { icon: '💰', color: '#D70100' }; // Red for spending/negative
    }

    // Default to Orange (general activity)
    return { icon: '⭐', color: '#FA6400' };
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
    
    // Add animated ring for first activity with activity color
    const firstActivityType = getActivityType(firstPoint.label);
    const firstRing = {
      id: 0,
      lat: firstPoint.lat,
      lng: firstPoint.lon,
      radius: 12,
      color: firstActivityType.color,
      speed: 2,
      repeat: 0, // Don't repeat - grow once and stay
      timestamp: Date.now()
    };
    setActiveRings([firstRing]);
    
    // Set first activity card
    const firstCardData = {
      id: 0,
      lat: firstPoint.lat,
      lng: firstPoint.lon,
      text: firstPoint.label,
      icon: firstActivityType.icon,
      color: firstActivityType.color,
      points: firstPoint.points,
      timestamp: firstPoint.timestamp, // Use actual activity timestamp
      displayTime: Date.now() // When card was shown
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

        // Only add ring for the NEW activity (clear old rings, keep only current)
        const activityType = getActivityType(point.label);
        const ring = {
          id: nextIndex,
          lat: point.lat,
          lng: point.lon,
          radius: 12,
          color: activityType.color,
          speed: 2,
          repeat: 0, // Don't repeat - grow once and stay
          timestamp: Date.now()
        };
        // Only keep the current ring, previous ones are replaced by static points
        setActiveRings([ring]);
        
        // Set current activity card (separate from pulsing rings)
        const cardData = {
          id: nextIndex,
          lat: point.lat,
          lng: point.lon,
          text: point.label,
          icon: activityType.icon,
          color: activityType.color,
          points: point.points,
          timestamp: point.timestamp, // Use actual activity timestamp
          displayTime: Date.now() // When card was shown
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
      color: activityType.color,
      points: pointData.points,
      timestamp: pointData.timestamp, // Use actual activity timestamp
      displayTime: Date.now() // When card was shown
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

  // Update current time every second for relative timestamps
  useEffect(() => {
    timeUpdateRef.current = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      if (timeUpdateRef.current) {
        clearInterval(timeUpdateRef.current);
      }
    };
  }, []);

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

  // Don't clean up rings - keep them visible as permanent pin drops
  // Rings will grow once and remain at full size

  // Show loading screen while initial data loads
  if (isLoading) {
    return <MMSLoadingScreen isDataReady={isDataReady} />;
  }

  return (
    <div className="relative w-full h-screen" style={{ backgroundColor: '#FFD200' }}>
      <Globe
        ref={globeEl}
        globeImageUrl="/light-earth-map.jpg"
        backgroundColor="rgba(255,210,0,1)"
        width={dimensions.width}
        height={dimensions.height}
        atmosphereColor="rgba(200,200,200,0.3)"
        atmosphereAltitude={0.15}

        // Static points for activities that have been shown - store activity type color
        pointsData={visiblePoints.map(p => ({
          ...p,
          activityColor: getActivityType(p.label).color
        }))}
        pointLat={(p) => p.lat}
        pointLng={(p) => p.lon}
        pointColor={(p) => p.activityColor || '#FA6400'}
        pointAltitude={0.02}
        pointRadius={0.5}
        onPointClick={handleGlobeClick}

        // Animated rings with activity-specific colors
        ringsData={activeRings}
        ringMaxRadius="radius"
        ringColor={(ring) => {
          // Convert hex to rgba with fade animation
          const hex = ring.color;
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return (time) => `rgba(${r}, ${g}, ${b}, ${Math.sqrt(1 - time) * 0.9})`;
        }}
        ringPropagationSpeed="speed"
        ringRepeatPeriod="repeat"
        ringLat="lat"
        ringLng="lng"

      />
      
      {/* Independent Activity Card Overlay - Fixed bottom on mobile, centered on desktop */}
      {currentCard && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div
            className="absolute left-1/2"
            style={{
              // Mobile: fixed bottom center, Desktop: centered
              bottom: isMobile ? '40px' : 'auto',
              top: isMobile ? 'auto' : '50%',
              left: '50%',
              transform: isMobile ? 'translateX(-50%)' : 'translate(-50%, -50%)',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: `2px solid ${currentCard.color || '#FA6400'}`,
              borderRadius: '16px',
              padding: isMobile ? '14px 18px' : '18px 24px',
              maxWidth: isMobile ? 'calc(100% - 32px)' : '360px',
              minWidth: isMobile ? '280px' : '280px',
              width: isMobile ? 'calc(100% - 32px)' : 'auto',
              margin: '0',
              boxShadow: `
                0 12px 40px rgba(0, 0, 0, 0.15),
                0 4px 12px rgba(0, 0, 0, 0.1)
              `,
              animation: isMobile ? 'cardSlideUp 0.6s ease-out forwards' : 'cardSlideIn 0.6s ease-out forwards'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{
                background: `${currentCard.color || '#FA6400'}20`,
                border: `2px solid ${currentCard.color || '#FA6400'}`,
                borderRadius: '10px',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '40px',
                height: '40px',
                fontSize: '18px'
              }}>
                {currentCard.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  color: '#5A1F06',
                  lineHeight: '1.5',
                  wordWrap: 'break-word',
                  fontWeight: '600',
                  fontSize: isMobile ? '14px' : '15px',
                  fontFamily: '"All Together Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
                }}>
                  {currentCard.text}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '6px',
                  gap: '8px'
                }}>
                  {currentCard.points && (
                    <div style={{
                      color: currentCard.points.startsWith('-') ? '#D70100' : '#00A836',
                      fontSize: isMobile ? '12px' : '13px',
                      fontWeight: '700',
                      fontFamily: '"All Together Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
                    }}>
                      {currentCard.points}
                    </div>
                  )}
                  <div style={{
                    color: '#999',
                    fontSize: isMobile ? '11px' : '12px',
                    fontWeight: '500',
                    marginLeft: 'auto',
                    fontFamily: '"All Together Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
                  }}>
                    {getRelativeTime(currentCard.timestamp)}
                  </div>
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
            transform: translate(-50%, -50%) translateY(-20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) translateY(0) scale(1);
          }
        }

        @keyframes cardSlideUp {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(30px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }
      `}</style>
      
      {/* M&M'S Fun Club Logo */}
      <div className="absolute top-6 right-6 z-40">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fun-club-logo-var2-4iEoRI3BA3ArXmhgtSawr5k2b5jp57.svg"
          alt="M&M'S Fun Club"
          className="h-16 w-auto drop-shadow-lg"
        />
      </div>

      {/* Progressive loading indicator */}
      {isLoadingMore && (
        <div className="absolute top-4 left-4 bg-blue-900/60 text-white p-3 rounded-lg text-sm backdrop-blur-sm">
          Loading more activities... ({totalFetched}/{maxTotal})
        </div>
      )}

      {/* Hidden debug info - only show if there's an error */}
      {error && (
        <div className="absolute top-4 left-4 bg-red-900/80 text-white p-3 rounded-lg text-sm">
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default MMSGlobe;