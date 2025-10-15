import { useState, useEffect } from 'react';

export const useMMSGlobeData = ({ limit = 15 } = {}) => {
  const [points, setPoints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/mms-activity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ limit }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setPoints(data.points || []);
      } catch (err) {
        console.error('Error fetching M&M\'S activity data:', err);
        setError(err.message);
        setPoints([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [limit]);

  return { points, isLoading, error };
};
