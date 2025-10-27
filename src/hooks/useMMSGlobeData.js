import { useState, useEffect, useRef } from 'react';

export const useMMSGlobeData = ({
  initialLimit = 20,
  batchSize = 30,
  maxTotal = 100,
  batchDelay = 15000, // 15 seconds between batches
  minLoadingTime = 5000, // Minimum time to show loading screen (ms)
  apiEndpoint = '/api/mms-activity', // Configurable API endpoint
  programId = '10000154' // M&M's Fun Club program ID
} = {}) => {
  const [points, setPoints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalFetched, setTotalFetched] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);

  const batchTimerRef = useRef(null);
  const hasInitialLoadedRef = useRef(false);
  const loadStartTimeRef = useRef(Date.now());

  const fetchBatch = async (limit, offset = 0) => {
    try {
      // Add timestamp to ensure fresh data on every request
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify({
          limit,
          programId, // Allow filtering by program if API supports it
          _t: Date.now() // Cache-busting timestamp
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const pointsWithTimestamps = data.points || [];

      // Log timestamp info for debugging
      if (pointsWithTimestamps.length > 0) {
        const now = Date.now();
        const oldestTimestamp = Math.min(...pointsWithTimestamps.map(p => p.timestamp));
        const newestTimestamp = Math.max(...pointsWithTimestamps.map(p => p.timestamp));
        const oldestAge = Math.floor((now - oldestTimestamp) / 1000 / 60); // minutes
        const newestAge = Math.floor((now - newestTimestamp) / 1000 / 60); // minutes

        console.log(`[M&M'S Globe] Fetched ${pointsWithTimestamps.length} activities:`);
        console.log(`  - Oldest: ${oldestAge} minutes ago (${new Date(oldestTimestamp).toLocaleString()})`);
        console.log(`  - Newest: ${newestAge} minutes ago (${new Date(newestTimestamp).toLocaleString()})`);
      }

      return pointsWithTimestamps;
    } catch (err) {
      console.error('Error fetching M&M\'S activity data:', err);
      throw err;
    }
  };

  // Initial load
  useEffect(() => {
    const loadInitialData = async () => {
      if (hasInitialLoadedRef.current) return;

      setIsLoading(true);
      setError(null);

      try {
        const initialPoints = await fetchBatch(initialLimit);

        // Mark data as ready immediately (for loading screen last stage)
        setIsDataReady(true);

        // Calculate how long we've been loading
        const elapsed = Date.now() - loadStartTimeRef.current;
        const remainingTime = Math.max(0, minLoadingTime - elapsed);

        // If we loaded too fast, wait for the minimum display time
        if (remainingTime > 0) {
          console.log(`[M&M'S Globe] Data loaded in ${elapsed}ms, waiting ${remainingTime}ms more for animations...`);
          await new Promise(resolve => setTimeout(resolve, remainingTime));
        }

        setPoints(initialPoints);
        setTotalFetched(initialPoints.length);
        hasInitialLoadedRef.current = true;

        console.log(`[M&M'S Globe] Loaded initial ${initialPoints.length} activities`);
      } catch (err) {
        setError(err.message);
        setPoints([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [initialLimit, minLoadingTime]);

  // Progressive background loading
  useEffect(() => {
    if (!hasInitialLoadedRef.current || totalFetched >= maxTotal) {
      return;
    }

    const loadNextBatch = async () => {
      if (totalFetched >= maxTotal) {
        return;
      }

      setIsLoadingMore(true);

      try {
        // Fetch a larger batch and slice off what we've already loaded
        const fetchSize = totalFetched + batchSize;
        const allPoints = await fetchBatch(Math.min(fetchSize, maxTotal));

        // Only take the new points we haven't seen
        const newPoints = allPoints.slice(totalFetched);

        if (newPoints.length > 0) {
          setPoints(prev => [...prev, ...newPoints]);
          setTotalFetched(prev => prev + newPoints.length);

          console.log(`[M&M'S Globe] Loaded batch of ${newPoints.length} activities (total: ${totalFetched + newPoints.length}/${maxTotal})`);
        }
      } catch (err) {
        console.error('Error loading next batch:', err);
      } finally {
        setIsLoadingMore(false);
      }
    };

    // Schedule next batch
    batchTimerRef.current = setTimeout(() => {
      loadNextBatch();
    }, batchDelay);

    return () => {
      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current);
      }
    };
  }, [totalFetched, maxTotal, batchSize, batchDelay]);

  return {
    points,
    isLoading,
    error,
    isLoadingMore,
    totalFetched,
    maxTotal,
    isDataReady
  };
};
