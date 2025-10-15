import express from 'express';
import { createServer as createViteServer } from 'vite';
import fetch from 'node-fetch';
import { AbortController } from 'abort-controller';
import dotenv from 'dotenv';
import { generateMockActivityData } from './src/utils/mockData.js';
import { getCachedCoordinates } from './utils/cityStateCache.js';

dotenv.config();

const app = express();
app.use(express.json());

const geocodeCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Activity data cache with 20-minute TTL
const activityCache = {
  data: null,
  timestamp: null,
  isWarm: false
};
const ACTIVITY_CACHE_TTL = 20 * 60 * 1000; // 20 minutes

// Background fetch queue for progressive loading
let backgroundFetchInProgress = false;

// Warm up the cache with all 100 activities in the background
async function warmActivityCache() {
  if (backgroundFetchInProgress) {
    console.log('Cache warming already in progress, skipping...');
    return;
  }

  try {
    backgroundFetchInProgress = true;
    console.log('🔥 Starting cache warming for 100 activities...');

    // Authenticate with Metabase
    const sessionToken = await getMetabaseSession();

    // Fetch from question 178 with M&M's program_id filter
    const parameters = [{
      type: 'category',
      target: ['variable', ['template-tag', 'program_id']],
      value: '10000154'
    }];

    let data = await fetchMetabaseQuestion(sessionToken, 178, parameters);

    // Transform Metabase data structure
    data = data.map((row, index) => ({
      sentence: row['Activity Marquee String'],
      ts: row['Action Timestamp'],
      ip: row['IP Address'],
      action_id: row['Participant ID'] || index,
      city: row['City'],
      state: row['State'],
      points: row['Branded Points']
    }));

    const validRows = data.filter(row => row.sentence && row.ts);
    const top100 = validRows.slice(0, 100);

    console.log(`🔄 Processing ${top100.length} activities for cache...`);

    // Process in batches of 25 to avoid overwhelming the geocoding APIs
    const allPoints = [];
    for (let i = 0; i < top100.length; i += 25) {
      const batch = top100.slice(i, i + 25);
      console.log(`Processing batch ${Math.floor(i / 25) + 1}/4 (${batch.length} items)...`);

      const result = await processActivityBatch(batch);
      allPoints.push(...result.points);

      // Small delay between batches
      if (i + 25 < top100.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Store in cache
    activityCache.data = allPoints;
    activityCache.timestamp = Date.now();
    activityCache.isWarm = true;

    console.log(`✅ Cache warmed with ${allPoints.length} geocoded activities`);
  } catch (error) {
    console.error('❌ Cache warming failed:', error.message);
  } finally {
    backgroundFetchInProgress = false;
  }
}

// Check if cache is valid
function isCacheValid() {
  if (!activityCache.data || !activityCache.timestamp) {
    return false;
  }
  const age = Date.now() - activityCache.timestamp;
  return age < ACTIVITY_CACHE_TTL;
}

function isPrivateIP(ip) {
  if (!ip) return true;
  
  // Handle IPv6 addresses - most should be public
  if (ip.includes(':')) {
    // Skip local/private IPv6 ranges
    if (ip.startsWith('::1') || ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80')) {
      return true;
    }
    return false; // Most IPv6 are public
  }
  
  // Handle IPv4 addresses
  const parts = ip.split('.');
  if (parts.length !== 4) return true;
  
  const first = parseInt(parts[0]);
  const second = parseInt(parts[1]);
  
  if (first === 10) return true;
  if (first === 172 && second >= 16 && second <= 31) return true;
  if (first === 192 && second === 168) return true;
  if (first === 127) return true;
  if (first === 0) return true;
  if (first >= 224) return true;
  
  return false;
}

async function geocodeIP(ip) {
  if (!ip || isPrivateIP(ip)) {
    return null;
  }
  
  const cacheKey = ip;
  const cached = geocodeCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  try {
    let result = null;
    
    if (process.env.IPINFO_TOKEN) {
      const response = await fetch(
        `https://ipinfo.io/${ip}?token=${process.env.IPINFO_TOKEN}`,
        { timeout: 5000 }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.loc) {
          const [lat, lon] = data.loc.split(',').map(Number);
          result = { lat, lon };
        }
      }
    } else {
      const response = await fetch(
        `https://ipapi.co/${ip}/json/`,
        { timeout: 5000 }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.latitude && data.longitude) {
          result = { lat: data.latitude, lon: data.longitude };
        }
      }
    }
    
    geocodeCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    return result;
  } catch (error) {
    console.error(`Geocoding failed for IP ${ip}:`, error.message);
    return null;
  }
}

async function geocodeWithConcurrencyLimit(ips, limit = 3) {
  const results = new Map();
  const uniqueIPs = [...new Set(ips.filter(ip => ip && !isPrivateIP(ip)))];
  
  // Add fallback coordinates for testing when geocoding fails
  const fallbackCoords = [
    { lat: 40.7128, lon: -74.0060 }, // NYC
    { lat: 34.0522, lon: -118.2437 }, // LA
    { lat: 41.8781, lon: -87.6298 }, // Chicago
    { lat: 29.7604, lon: -95.3698 }, // Houston
    { lat: 33.7490, lon: -84.3880 }, // Atlanta
    { lat: 47.6062, lon: -122.3321 }, // Seattle
    { lat: 37.7749, lon: -122.4194 }, // SF
    { lat: 39.9526, lon: -75.1652 }, // Philadelphia
    { lat: 32.7767, lon: -96.7970 }, // Dallas
  ];
  
  for (let i = 0; i < uniqueIPs.length; i += limit) {
    const batch = uniqueIPs.slice(i, i + limit);
    const batchResults = await Promise.all(
      batch.map(async (ip, index) => {
        const coords = await geocodeIP(ip);
        // Use fallback coordinates if geocoding fails (for testing)
        const finalCoords = coords || fallbackCoords[index % fallbackCoords.length];
        return { ip, coords: finalCoords };
      })
    );
    
    batchResults.forEach(({ ip, coords }) => {
      results.set(ip, coords);
    });
    
    if (i + limit < uniqueIPs.length) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Longer delay
    }
  }
  
  return results;
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

  // Build query parameters for filtering
  const params = new URLSearchParams();
  if (Object.keys(parameters).length > 0) {
    params.append('parameters', JSON.stringify(parameters));
  }

  const url = `${baseUrl}/api/card/${questionId}/query/json${params.toString() ? '?' + params.toString() : ''}`;
  console.log('Fetching from Metabase question:', questionId);

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

app.post('/api/activity', async (req, res) => {
  try {
    const limit = req.body.limit || 30;

    let data;
    const useMockData = process.env.USE_MOCK_DATA === 'true' || !process.env.METABASE_URL || !process.env.METABASE_USERNAME || !process.env.METABASE_PASSWORD;

    if (useMockData) {
      console.log('Using mock data (set USE_MOCK_DATA=false and configure Metabase credentials to use real data)');
      data = generateMockActivityData(limit);
    } else {
      console.log('Fetching real data from Metabase question 178...');

      try {
        // Authenticate with Metabase
        const sessionToken = await getMetabaseSession();
        console.log('Metabase authentication successful');

        // Fetch from question 178 with program_id filter
        const parameters = [{ type: 'category', target: ['variable', ['template-tag', 'program_id']], value: '10000154' }];
        data = await fetchMetabaseQuestion(sessionToken, 178, parameters);
        console.log(`Fetched ${data.length} rows from Metabase`);

        // Debug: Log first row structure
        if (data.length > 0) {
          console.log('Sample row:', JSON.stringify(data[0], null, 2));
          console.log('Row keys:', Object.keys(data[0]));
        }

        // Transform Metabase data structure to match expected format
        data = data.map((row, index) => ({
          sentence: row['Activity Marquee String'],
          ts: row['Action Timestamp'],
          ip: row['IP Address'],
          action_id: row['Participant ID'] || index,
          city: row['City'],
          state: row['State']
        }));

        // Limit results if needed
        if (limit && data.length > limit) {
          data = data.slice(0, limit);
        }
      } catch (metabaseError) {
        console.error('Metabase fetch failed, falling back to mock data:', metabaseError.message);
        data = generateMockActivityData(limit);
      }
    }
    
    const validRows = data.filter(row => row.sentence && row.ts);
    console.log(`Found ${validRows.length} valid activity rows`);
    
    const ips = validRows.map(row => row.ip).filter(Boolean);
    console.log(`Found ${ips.length} IPs to geocode:`, ips.slice(0, 3));
    
    const geocodeResults = await geocodeWithConcurrencyLimit(ips, 5);
    console.log(`Geocoded ${geocodeResults.size} IPs successfully`);
    
    const points = [];
    let skippedNoIP = 0;
    let skippedNoGeocode = 0;
    let skippedNoCoords = 0;
    
    for (const row of validRows) {
      let coords = null;
      
      // Try IP geocoding first
      if (row.ip && geocodeResults.has(row.ip)) {
        coords = geocodeResults.get(row.ip);
      }
      
      // Fallback to mock coordinates if available and no IP geocoding
      if (!coords && row._mockLat && row._mockLng) {
        coords = { lat: row._mockLat, lon: row._mockLng };
      }
      
      if (coords) {
        points.push({
          lat: coords.lat,
          lon: coords.lon,
          label: row.sentence,
          timestamp: new Date(row.ts).getTime(),
          actionId: row.action_id
        });
      } else if (!row.ip) {
        skippedNoIP++;
      } else {
        skippedNoGeocode++;
      }
    }
    
    console.log(`Point creation: ${points.length} created, ${skippedNoIP} no IP, ${skippedNoGeocode} no geocode, ${skippedNoCoords} no coords`);
    
    points.sort((a, b) => {
      if (b.timestamp !== a.timestamp) {
        return b.timestamp - a.timestamp;
      }
      return b.actionId - a.actionId;
    });
    
    console.log(`Returning ${points.length} points to client`);
    res.json({ points, totalRows: validRows.length });
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: error.message });
  }
});

// Process and geocode a batch of activity rows
async function processActivityBatch(rows) {
  const rowsWithIP = [];
  const rowsNeedingCityState = [];

  for (const row of rows) {
    if (row.ip && !isPrivateIP(row.ip)) {
      rowsWithIP.push(row);
    } else if (row.city && row.state) {
      rowsNeedingCityState.push(row);
    }
  }

  const points = [];
  let fromIP = 0;
  let fromCityState = 0;
  let fromCache = 0;
  let failed = 0;

  // STEP 1: Geocode all IPs in parallel
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
          timestamp: new Date(row.ts).getTime(),
          actionId: row.action_id,
          city: row.city,
          state: row.state,
          points: row.points,
          source: 'ip'
        });
        fromIP++;
      } else {
        if (row.city && row.state) {
          rowsNeedingCityState.push(row);
        } else {
          failed++;
        }
      }
    }
  }

  // STEP 2: Geocode city/state combinations
  if (rowsNeedingCityState.length > 0) {
    for (const row of rowsNeedingCityState) {
      const cachedCoords = getCachedCoordinates(row.city, row.state);
      const cachedHit = !!cachedCoords;
      const coords = cachedCoords || await geocodeCityState(row.city, row.state);

      if (!cachedHit && coords) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (coords) {
        points.push({
          lat: coords.lat,
          lon: coords.lon,
          label: row.sentence,
          timestamp: new Date(row.ts).getTime(),
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
  }

  return {
    points,
    stats: { fromIP, fromCityState, fromCache, failed, total: rows.length }
  };
}

// Geocode city/state combination
async function geocodeCityState(city, state) {
  if (!city || !state) return null;

  const cacheKey = `${city},${state}`;

  if (geocodeCache.has(cacheKey)) {
    const cached = geocodeCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
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

// MMS-specific endpoint with progressive loading and caching
app.post('/api/mms-activity', async (req, res) => {
  try {
    const { limit = 15, offset = 0 } = req.body; // Support pagination

    // Check if cache is valid and has data
    if (isCacheValid() && activityCache.data) {
      console.log(`⚡ Serving from cache (age: ${Math.floor((Date.now() - activityCache.timestamp) / 1000)}s)`);

      const cachedData = activityCache.data.slice(offset, offset + limit);
      const hasMore = (offset + limit) < activityCache.data.length;

      res.json({
        points: cachedData,
        fromCache: true,
        hasMore,
        total: activityCache.data.length,
        cacheAge: Date.now() - activityCache.timestamp
      });

      // Trigger background refresh if cache is getting old (> 15 minutes)
      const cacheAge = Date.now() - activityCache.timestamp;
      if (cacheAge > 15 * 60 * 1000 && !backgroundFetchInProgress) {
        console.log('🔄 Cache is aging, triggering background refresh...');
        warmActivityCache().catch(err => console.error('Background refresh failed:', err));
      }

      return;
    }

    // Cache miss or expired - fetch fresh data
    console.log('⏳ Cache miss, fetching fresh M&M\'S Fun Club data...');

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

    // Transform Metabase data structure
    data = data.map((row, index) => ({
      sentence: row['Activity Marquee String'],
      ts: row['Action Timestamp'],
      ip: row['IP Address'],
      action_id: row['Participant ID'] || index,
      city: row['City'],
      state: row['State'],
      points: row['Branded Points']
    }));

    const validRows = data.filter(row => row.sentence && row.ts);
    console.log(`Found ${validRows.length} valid activity rows`);

    // For first request, return fast initial load (15 items)
    const initialBatch = validRows.slice(0, 15);
    console.log(`Processing initial batch of ${initialBatch.length} activities...`);

    const result = await processActivityBatch(initialBatch);

    // Send response immediately
    res.json({
      points: result.points,
      fromCache: false,
      hasMore: true,
      total: 100, // We'll warm up to 100
      stats: result.stats
    });

    // Trigger background warming for remaining activities (up to 100 total)
    console.log('🚀 Starting background cache warming...');
    warmActivityCache().catch(err => console.error('Background warming failed:', err));
  } catch (error) {
    console.error('MMS API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Removed old geocoding code - now using processActivityBatch() helper function
// Dead code cleanup - endpoint returns early after sending initial batch

// Geocode city/state combination
async function geocodeCityStateOld(city, state) {
  // This function is kept for reference but not used
  // New code uses processActivityBatch() instead
  return null;
}

// MMS-specific endpoint - old version before caching (REMOVED)
// The new version above handles:
// 1. Check cache first (instant response if valid)
// 2. If cache miss, return 15 items quickly
// 3. Trigger background warming for 100 items
// 4. Subsequent requests get instant cache hits

async function geocodeCityStateRemoved(city, state) {
  if (!city || !state) return null;

  const cacheKey = `${city},${state}`;
  const cached = geocodeCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const query = `${city}, ${state}, USA`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'PerkActivityGlobe/1.0'
      }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data && data.length > 0 && data[0].lat && data[0].lon) {
      const result = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      geocodeCache.set(cacheKey, { data: result, timestamp: Date.now() });

      return result;
    }

    return null;
  } catch (error) {
    console.error(`Geocoding ${city}, ${state} failed:`, error.message);
    return null;
  }
}

async function createServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });
  
  app.use(vite.middlewares);
  
  const port = process.env.PORT || 5173;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

createServer();