import { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import { useActivityGlobeData } from '../hooks/useActivityGlobeData';

const ActivityFeed = () => {
  const globeEl = useRef();
  const { points, isLoading, error } = useActivityGlobeData({ limit: 100 });
  const [globeReady, setGlobeReady] = useState(false);

  useEffect(() => {
    if (!globeEl.current) return;
    
    globeEl.current.controls().autoRotate = true;
    globeEl.current.controls().autoRotateSpeed = 0.3;
    
    const directionalLight = globeEl.current
      .scene()
      .children.find((obj3d) => obj3d.type === 'DirectionalLight');
    if (directionalLight) {
      directionalLight.intensity = 0.8;
    }
    
    setGlobeReady(true);
  }, []);

  useEffect(() => {
    if (globeReady && globeEl.current && points.length > 0) {
      const firstPoint = points[0];
      globeEl.current.pointOfView({
        lat: firstPoint.lat,
        lng: firstPoint.lon,
        altitude: 2
      }, 1000);
    }
  }, [globeReady, points]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPointColor = (point) => {
    const age = Date.now() - point.timestamp;
    const hourInMs = 60 * 60 * 1000;
    
    if (age < hourInMs) return '#ff6b6b';
    if (age < 6 * hourInMs) return '#ffd43b'; 
    if (age < 24 * hourInMs) return '#51cf66';
    return '#339af0';
  };

  return (
    <div className="relative w-full h-screen bg-gray-900">
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        pointsData={points}
        pointLat={(p) => p.lat}
        pointLng={(p) => p.lon}
        pointColor={getPointColor}
        pointAltitude={0.01}
        pointRadius={0.5}
        pointLabel={(p) => `
          <div class="bg-black/80 text-white p-2 rounded max-w-xs">
            <div class="text-sm font-semibold">${p.label}</div>
            <div class="text-xs text-gray-400 mt-1">${formatTimestamp(p.timestamp)}</div>
          </div>
        `}
        labelsData={points.slice(0, 10)}
        labelLat={(p) => p.lat}
        labelLng={(p) => p.lon}
        labelText={() => ''}
        labelSize={0.5}
        labelDotRadius={0.3}
        labelColor={() => 'rgba(255, 165, 0, 0.75)'}
        labelResolution={2}
        pointsMerge={false}
        animateIn={true}
      />
      
      <div className="absolute top-4 left-4 bg-black/70 text-white p-4 rounded-lg max-w-md">
        <h2 className="text-xl font-bold mb-2">Perk Activity Feed</h2>
        {isLoading && (
          <div className="text-sm text-gray-300">Loading activity data...</div>
        )}
        {error && (
          <div className="text-sm text-red-400">Error: {error}</div>
        )}
        {!isLoading && !error && (
          <>
            <div className="text-sm text-gray-300 mb-2">
              Showing {points.length} activities
            </div>
            <div className="text-xs space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400"></span>
                <span>Last hour</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                <span>Last 6 hours</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-400"></span>
                <span>Last 24 hours</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                <span>Older</span>
              </div>
            </div>
          </>
        )}
      </div>

      {!isLoading && !error && points.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-black/70 text-white p-4 rounded-lg max-w-md max-h-64 overflow-y-auto">
          <h3 className="text-sm font-bold mb-2">Recent Activities</h3>
          <div className="space-y-2">
            {points.slice(0, 10).map((point, idx) => (
              <div key={`${point.actionId}-${idx}`} className="text-xs">
                <div className="text-gray-300 truncate">{point.label}</div>
                <div className="text-gray-500">{formatTimestamp(point.timestamp)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;