import fetch from 'node-fetch';
import { AbortController } from 'abort-controller';

const geocodeCache = new Map();

// Inline city/state cache to avoid import issues in Vercel
const CITY_STATE_CACHE = {
  "Irvine,CA": { lat: 33.6846, lon: -117.8265 },
  "Park Ridge,IL": { lat: 42.0111, lon: -87.8406 },
  "Warren,OH": { lat: 41.2376, lon: -80.8184 },
  "Puyallup,WA": { lat: 47.1854, lon: -122.2929 },
  "Eubank,KY": { lat: 37.2867, lon: -84.6530 },
  // Add more as needed
};

function getCachedCoordinates(city, state) {
  if (!city || !state) return null;
  const key = `${city},${state}`;
  return CITY_STATE_CACHE[key] || null;
}

// Authenticate with Metabase and get session token
async function getMetabaseSession() {
  const { METABASE_URL, METABASE_USERNAME, METABASE_PASSWORD } = process.env;

  if (!METABASE_URL || !METABASE_USERNAME || !METABASE_PASSWORD) {
    throw new Error('Metabase credentials not configured');
  }

  const baseUrl = METABASE_URL.replace(/\/$/, '');
  const response = await fetch(`${baseUrl}/api/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: METABASE_USERNAME,
      password: METABASE_PASSWORD
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Metabase auth failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.id; // Session token
}

// Fetch data from Metabase question
async function fetchMetabaseQuestion(sessionToken, questionId, parameters = {}) {
  const { METABASE_URL } = process.env;
  const baseUrl = METABASE_URL.replace(/\/$/, '');

  // Build query parameters
  const params = new URLSearchParams();
  if (Object.keys(parameters).length > 0) {
    params.append('parameters', JSON.stringify(parameters));
  }

  const url = `${baseUrl}/api/card/${questionId}/query/json${params.toString() ? '?' + params.toString() : ''}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Metabase-Session': sessionToken
      },
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Metabase query failed: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

// Check if IP is private/local
function isPrivateIP(ip) {
  if (!ip) return true;

  if (ip.includes(':')) {
    if (ip.startsWith('::1') || ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80')) {
      return true;
    }
    return false;
  }

  const parts = ip.split('.');
  if (parts.length !== 4) return true;

  const first = parseInt(parts[0]);
  const second = parseInt(parts[1]);

  return (first === 10) ||
         (first === 172 && second >= 16 && second <= 31) ||
         (first === 192 && second === 168) ||
         (first === 127) ||
         (first === 169 && second === 254);
}

// Geocode IP address
async function geocodeIP(ip) {
  if (isPrivateIP(ip)) {
    return null;
  }

  if (geocodeCache.has(ip)) {
    const cached = geocodeCache.get(ip);
    if (Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
      return cached.data;
    }
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`http://ipapi.co/${ip}/json/`, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Perk Activity Globe/1.0' }
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.latitude && data.longitude && !data.error) {
      const result = { lat: data.latitude, lon: data.longitude };
      geocodeCache.set(ip, { data: result, timestamp: Date.now() });
      return result;
    }

    return null;
  } catch (error) {
    console.error(`Geocoding IP ${ip} failed:`, error.message);
    return null;
  }
}

// Geocode city/state combination
async function geocodeCityState(city, state) {
  if (!city || !state) return null;

  const cacheKey = `${city},${state}`;

  if (geocodeCache.has(cacheKey)) {
    const cached = geocodeCache.get(cacheKey);
    if (Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
      return cached.data;
    }
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    // Use Nominatim (OpenStreetMap) for city/state geocoding
    const query = encodeURIComponent(`${city}, ${state}, USA`);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      {
        signal: controller.signal,
        headers: { 'User-Agent': 'Perk Activity Globe/1.0' }
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data && data.length > 0 && data[0].lat && data[0].lon) {
      const result = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      geocodeCache.set(cacheKey, { data: result, timestamp: Date.now() });

      // Small delay handled by caller
      return result;
    }

    return null;
  } catch (error) {
    console.error(`Geocoding ${city}, ${state} failed:`, error.message);
    return null;
  }
}

// Geocode with concurrency limit
async function geocodeWithConcurrencyLimit(rows, limit = 3) {
  const results = new Map();

  for (let i = 0; i < rows.length; i += limit) {
    const batch = rows.slice(i, i + limit);
    const promises = batch.map(async (row) => {
      let coords = null;

      // Try IP geocoding first
      if (row.ip) {
        coords = await geocodeIP(row.ip);
      }

      // Fall back to city/state if IP geocoding failed
      if (!coords && row.city && row.state) {
        coords = await geocodeCityState(row.city, row.state);
      }

      return { row, coords };
    });

    const batchResults = await Promise.all(promises);

    batchResults.forEach(({ row, coords }) => {
      if (coords) {
        results.set(row, coords);
      }
    });

    // Add delay between batches
    if (i + limit < rows.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return results;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { limit = 50 } = req.body;
    const maxLimit = Math.min(limit, 100); // Cap at 100 for performance

    console.log(`Fetching M&M'S Fun Club data from Metabase question 178 (limit: ${maxLimit})...`);

    // Authenticate with Metabase
    const sessionToken = await getMetabaseSession();
    console.log('Metabase authentication successful');

    // Fetch from question 178 with M&M's program_id filter
    const parameters = [{
      type: 'category',
      target: ['variable', ['template-tag', 'program_id']],
      value: '10000154'
    }];

    let data = await fetchMetabaseQuestion(sessionToken, 178, parameters);
    console.log(`Fetched ${data.length} rows from Metabase`);

    // Transform Metabase data structure to match expected format
    data = data.map((row, index) => ({
      sentence: row['Activity Marquee String'],
      ts: row['Action Timestamp'],
      timestamp_ms: row['Timestamp (ms)'], // Unix timestamp from SQL if available
      ip: row['IP Address'],
      action_id: row['Participant ID'] || index,
      city: row['City'],
      state: row['State'],
      points: row['Branded Points']
    }));

    // Filter valid rows
    const validRows = data.filter(row => row.sentence && row.ts);
    console.log(`Found ${validRows.length} valid activity rows`);

    // Limit results
    const rowsToProcess = validRows.slice(0, maxLimit);

    // Separate rows with IPs from those needing city/state geocoding
    const rowsWithIP = [];
    const rowsNeedingCityState = [];

    for (const row of rowsToProcess) {
      if (row.ip && !isPrivateIP(row.ip)) {
        rowsWithIP.push(row);
      } else if (row.city && row.state) {
        rowsNeedingCityState.push(row);
      }
    }

    console.log(`Geocoding plan: ${rowsWithIP.length} IPs in parallel, ${rowsNeedingCityState.length} city/state lookups`);

    const points = [];
    let fromIP = 0;
    let fromCityState = 0;
    let failed = 0;

    // STEP 1: Geocode all IPs in parallel (fast, no rate limits)
    if (rowsWithIP.length > 0) {
      const ipPromises = rowsWithIP.map(async (row) => {
        const coords = await geocodeIP(row.ip);
        return { row, coords };
      });

      const ipResults = await Promise.all(ipPromises);

      for (const { row, coords } of ipResults) {
        if (coords) {
          points.push({
            lat: coords.lat,
            lon: coords.lon,
            label: row.sentence,
            timestamp: row.timestamp_ms || new Date(row.ts).getTime(), // Use pre-calculated timestamp if available
            actionId: row.action_id,
            city: row.city,
            state: row.state,
            points: row.points,
            source: 'ip'
          });
          fromIP++;
        } else {
          // IP geocoding failed, add to city/state queue
          if (row.city && row.state) {
            rowsNeedingCityState.push(row);
          } else {
            failed++;
          }
        }
      }
    }

    // STEP 2: Geocode city/state - check cache first!
    if (rowsNeedingCityState.length > 0) {
      let fromCache = 0;

      for (let i = 0; i < rowsNeedingCityState.length; i++) {
        const row = rowsNeedingCityState[i];

        // Try cache first
        let coords = getCachedCoordinates(row.city, row.state);
        const cachedHit = !!coords;

        // Fall back to API if not in cache
        if (!coords) {
          coords = await geocodeCityState(row.city, row.state);
          // Only delay after API calls (not cache hits)
          if (i < rowsNeedingCityState.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        if (coords) {
          points.push({
            lat: coords.lat,
            lon: coords.lon,
            label: row.sentence,
            timestamp: row.timestamp_ms || new Date(row.ts).getTime(), // Use pre-calculated timestamp if available
            actionId: row.action_id,
            city: row.city,
            state: row.state,
            points: row.points,
            source: cachedHit ? 'cache' : 'city-state'
          });
          if (cachedHit) fromCache++;
          else fromCityState++;
        } else {
          failed++;
        }
      }

      if (fromCache > 0) {
        console.log(`${fromCache} locations loaded instantly from cache!`);
      }
    }

    // Sort by timestamp (most recent first)
    points.sort((a, b) => b.timestamp - a.timestamp);

    console.log(`Geocoding summary: ${fromIP} from IP, ${fromCityState} from city/state, ${failed} failed`);
    console.log(`Returning ${points.length} points to client`);

    // Set no-cache headers to ensure fresh data on every request
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.status(200).json({
      points,
      stats: {
        total: rowsToProcess.length,
        fromIP,
        fromCityState,
        failed
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
