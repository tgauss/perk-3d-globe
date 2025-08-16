import { useState, useEffect } from 'react';

export function useActivityGlobeData({ limit = 30 } = {}) {
  const [points, setPoints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/activity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ limit }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!cancelled) {
          setPoints(data.points || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          console.error('Error fetching activity data:', err);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [limit]);

  return { points, isLoading, error };
}

export default useActivityGlobeData;